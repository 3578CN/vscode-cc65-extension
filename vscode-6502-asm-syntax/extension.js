// 6502 汇编语法扩展 - 悬停提示提供器
// 说明: 为常用 6502 指令提供简要说明、影响标志位、典型寻址模式。支持大小写不敏感匹配。
// 作者: Lion
// 邮箱: chengbin@3578.cn
// 日期: 2025-09-23
// 备注: 可继续扩展指令说明或从外部 JSON 载入。

const vscode = require('vscode');

// 指令基础资料（可按需补充 / 拆分到独立文件）
// 每条指令: 简要, 作用, 标志位, 寻址, 示例
const INSTRUCTION_INFO = {
	ADC: {
		brief: '加法: A = A + M + C',
		flags: 'N V Z C (根据结果更新)',
		modes: '立即(#), 零页, 零页X, 绝对, 绝对X, 绝对Y, (零页,X), (零页),Y',
		example: 'ADC #$10 ; A = A + $10 + C'
	},
	SBC: {
		brief: '减法: A = A - M - (1-C)',
		flags: 'N V Z C',
		modes: '同 ADC',
		example: 'SBC $00     ; A = A - [$00] - (1-C)'
	},
	LDA: {
		brief: '装载累加器 A',
		flags: 'N Z',
		modes: '立即, 零页, 零页X, 绝对, 绝对X, 绝对Y, (零页,X), (零页),Y',
		example: 'LDA #$01'
	},
	LDX: { brief: '装载 X 寄存器', flags: 'N Z', modes: '立即, 零页, 零页Y, 绝对, 绝对Y', example: 'LDX $00' },
	LDY: { brief: '装载 Y 寄存器', flags: 'N Z', modes: '立即, 零页, 零页X, 绝对, 绝对X', example: 'LDY #10' },
	STA: { brief: '存储 A 到内存', flags: '无', modes: '零页, 零页X, 绝对, 绝对X, 绝对Y, (零页,X), (零页),Y', example: 'STA $0200' },
	STX: { brief: '存储 X', flags: '无', modes: '零页, 零页Y, 绝对', example: 'STX $00' },
	STY: { brief: '存储 Y', flags: '无', modes: '零页, 零页X, 绝对', example: 'STY $10' },
	INC: { brief: '内存加一', flags: 'N Z', modes: '零页, 零页X, 绝对, 绝对X', example: 'INC $00' },
	INX: { brief: 'X = X + 1', flags: 'N Z', modes: '隐含', example: 'INX' },
	INY: { brief: 'Y = Y + 1', flags: 'N Z', modes: '隐含', example: 'INY' },
	DEC: { brief: '内存减一', flags: 'N Z', modes: '零页, 零页X, 绝对, 绝对X', example: 'DEC $10' },
	DEX: { brief: 'X = X - 1', flags: 'N Z', modes: '隐含', example: 'DEX' },
	DEY: { brief: 'Y = Y - 1', flags: 'N Z', modes: '隐含', example: 'DEY' },
	PHA: { brief: '压栈 A', flags: '无', modes: '隐含', example: 'PHA' },
	PHP: { brief: '压栈 P', flags: '无', modes: '隐含', example: 'PHP' },
	PLA: { brief: '出栈到 A', flags: 'N Z', modes: '隐含', example: 'PLA' },
	PLP: { brief: '出栈到 P', flags: '全部(恢复)', modes: '隐含', example: 'PLP' },
	TAX: { brief: 'A -> X', flags: 'N Z', modes: '隐含', example: 'TAX' },
	TAY: { brief: 'A -> Y', flags: 'N Z', modes: '隐含', example: 'TAY' },
	TXA: { brief: 'X -> A', flags: 'N Z', modes: '隐含', example: 'TXA' },
	TYA: { brief: 'Y -> A', flags: 'N Z', modes: '隐含', example: 'TYA' },
	TSX: { brief: 'S -> X (复制堆栈指针)', flags: 'N Z', modes: '隐含', example: 'TSX' },
	TXS: { brief: 'X -> S (设置堆栈指针)', flags: '无', modes: '隐含', example: 'TXS' },
	AND: { brief: '按位与: A = A & M', flags: 'N Z', modes: '与 LDA 类似', example: 'AND #$0F' },
	ORA: { brief: '按位或: A = A | M', flags: 'N Z', modes: '与 LDA 类似', example: 'ORA $10' },
	EOR: { brief: '按位异或: A = A ^ M', flags: 'N Z', modes: '与 LDA 类似', example: 'EOR #$FF' },
	CMP: { brief: '比较 A 和 M (A-M)', flags: 'N Z C', modes: '与 LDA 类似', example: 'CMP #$01' },
	CPX: { brief: '比较 X 和 M (X-M)', flags: 'N Z C', modes: '立即, 零页, 绝对', example: 'CPX $00' },
	CPY: { brief: '比较 Y 和 M (Y-M)', flags: 'N Z C', modes: '立即, 零页, 绝对', example: 'CPY #$10' },
	BCC: { brief: '条件跳转: C=0', flags: '无(仅读取)', modes: '相对', example: 'BCC LABEL' },
	BCS: { brief: '条件跳转: C=1', flags: '无', modes: '相对', example: 'BCS LABEL' },
	BEQ: { brief: '条件跳转: Z=1', flags: '无', modes: '相对', example: 'BEQ DONE' },
	BNE: { brief: '条件跳转: Z=0', flags: '无', modes: '相对', example: 'BNE LOOP' },
	BMI: { brief: '条件跳转: N=1', flags: '无', modes: '相对', example: 'BMI NEG' },
	BPL: { brief: '条件跳转: N=0', flags: '无', modes: '相对', example: 'BPL POS' },
	BVS: { brief: '条件跳转: V=1', flags: '无', modes: '相对', example: 'BVS OVF' },
	BVC: { brief: '条件跳转: V=0', flags: '无', modes: '相对', example: 'BVC OK' },
	CLC: { brief: '清除进位 C=0', flags: 'C', modes: '隐含', example: 'CLC' },
	SEC: { brief: '设置进位 C=1', flags: 'C', modes: '隐含', example: 'SEC' },
	CLI: { brief: '开中断 I=0', flags: 'I', modes: '隐含', example: 'CLI' },
	SEI: { brief: '关中断 I=1', flags: 'I', modes: '隐含', example: 'SEI' },
	CLD: { brief: '十进制模式关闭 D=0', flags: 'D', modes: '隐含', example: 'CLD' },
	SED: { brief: '十进制模式开启 D=1', flags: 'D', modes: '隐含', example: 'SED' },
	CLV: { brief: '清溢出 V=0', flags: 'V', modes: '隐含', example: 'CLV' },
	JMP: { brief: '无条件跳转 PC=addr', flags: '无', modes: '绝对, 间接', example: 'JMP ($FFFC)' },
	JSR: { brief: '子程序调用 (推返回地址)', flags: '无', modes: '绝对', example: 'JSR SUB' },
	RTS: { brief: '子程序返回', flags: '无', modes: '隐含', example: 'RTS' },
	BRK: { brief: '软件中断/断点', flags: 'B=1被压栈', modes: '隐含', example: 'BRK' },
	NOP: { brief: '空操作', flags: '无', modes: '隐含', example: 'NOP' },
	RTI: { brief: '从中断返回 (恢复P,PC)', flags: '全部(恢复)', modes: '隐含', example: 'RTI' },
	ROL: { brief: '循环左移 通过进位', flags: 'N Z C', modes: '累加器 或 内存: 零页,零页X,绝对,绝对X', example: 'ROL A' },
	ROR: { brief: '循环右移 通过进位', flags: 'N Z C', modes: '同 ROL', example: 'ROR $00' },
	ASL: { brief: '算术左移 *2', flags: 'N Z C', modes: '累加器 或 内存', example: 'ASL A' },
	LSR: { brief: '逻辑右移 /2 (最高位填0)', flags: 'N(=0) Z C', modes: '累加器 或 内存', example: 'LSR $10' },
};

function buildMarkdown(info, mnemonic) {
	if (!info) return null;
	const lines = [
		`**${mnemonic}**  —  ${info.brief}`,
		'',
		`标志位: ${info.flags}`,
		`寻址模式: ${info.modes}`,
		'',
		'示例:',
		'```asm',
		info.example,
		'```'
	];
	return new vscode.MarkdownString(lines.join('\n'));
}

function activate(context) {
	const provider = {
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position, /[A-Za-z]{2,4}/);
			if (!range) return;
			const word = document.getText(range).toUpperCase();
			const info = INSTRUCTION_INFO[word];
			if (!info) return;
			const md = buildMarkdown(info, word);
			if (md) {
				md.isTrusted = true; // 允许后续加入命令链接
				return new vscode.Hover(md, range);
			}
		}
	};
	context.subscriptions.push(
		vscode.languages.registerHoverProvider('6502-asm', provider)
	);
}

function deactivate() {}

module.exports = { activate, deactivate };
