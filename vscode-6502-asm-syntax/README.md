# VS Code 6502 汇编语法高亮扩展

专为 6502 汇编语言（.asm / .65s）文件设计的语法高亮扩展，覆盖指令、伪指令、寻址模式、宏、条件汇编、符号定义、表达式、注释 TODO 关键字等，并对各种寻址元素（括号、逗号、索引寄存器、操作数、非法索引）进行细粒度拆分着色。

## 特性概览
- 指令与大小写不敏感匹配（`ADC SBC LDA ...`）。
 - 鼠标悬停 6502 指令显示简要说明 / 影响标志位 / 典型寻址模式 / 示例（内置常见指令，可扩展）。
- cc65/ca65 常用伪指令与传统伪指令并行支持（如 `.byte .word .proc .endproc .segment .import .export` / `ORG DB DW EQU` 等）。
- 标签类型区分：普通标签、本地标签（`.local:`）、匿名/数字标签（`+:-:`、`1:`）、无冒号数据标签（`TABLE .byte`）。
- 宏定义 / 结束（传统 `MACRO/ENDM` 与 ca65 `.macro/.endmacro`）、宏参数（`?1` / `\1`）。
- 表达式与运算符（算术 / 逻辑 / 位 / 比较）。
- 字符串（单双引号 + 转义）。
- 立即数（`#` 前缀）与多进制数字：`$` / `0x` 十六进制，`%` 二进制，十进制。
- 寻址模式细分并可独立着色：
	- 立即数：`#value`
	- 零页：`$nn`
	- 零页,X：`$nn,X`（仅 X 合法）
	- 绝对：`$hhhh`
	- 绝对,X / 绝对,Y：`$hhhh,X` / `$hhhh,Y`
	- 间接前索引：`($nn,X)`（仅 X 合法）
	- 间接后索引：`($nn),Y`（仅 Y 合法）
	- 复合括号数字 / 符号在索引模式下按数值或符号分别高亮。
- 非法索引检测：逗号后若不是 `X` / `Y`（如 `,A` / `,Q`）标记为 `invalid.illegal.index.register.6502-asm`。
- 逗号、括号、索引寄存器、操作数、空格分离捕获，方便主题精准配色。

## 主要 TextMate Scope 列表（部分）
- 指令：`keyword.control.6502-asm`
- 伪指令：`keyword.directive.6502-asm` / `keyword.directive.cc65.6502-asm`
- 寄存器：`variable.language.register.6502-asm`（普通 A/X/Y/SP/PC）
- 索引寄存器（寻址逗号后合法 X/Y）：`variable.language.register.index.6502-asm`
- 数字：`constant.numeric.hex(.dollar/.0x).6502-asm` / `constant.numeric.binary.6502-asm` / `constant.numeric.decimal.6502-asm`
- 立即数：`constant.language.immediate.6502-asm`
- 字符串：`string.quoted.(single|double).6502-asm`
- 普通标签：`entity.name.label.6502-asm`
- 本地标签：`entity.name.label.local.6502-asm`
- 匿名 / 数字标签：`entity.name.label.anonymous.6502-asm` / `entity.name.label.numeric.6502-asm`
- 数据标签（无冒号）：`entity.name.label.data.6502-asm`
- 符号赋值：`meta.symbol.assignment.6502-asm` + `keyword.operator.assignment.6502-asm`
- 符号引用：`variable.other.symbol.6502-asm`
- 宏名 / 参数：`entity.name.function.macro(.ca65).6502-asm` / `variable.parameter.macro(.ca65).6502-asm`
- 宏块：`meta.block.macro.ca65.6502-asm`
- 寻址标点：
	- 逗号：`punctuation.separator.addressing.comma.6502-asm`
	- 括号：`punctuation.addressing.paren.open/close.6502-asm`（并同时提供通用 `punctuation.section.parens.begin/end`）
- 索引空格占位：`meta.spacing.index.address`
- 非法索引：`invalid.illegal.index.register.6502-asm`

## 非法索引规则
在以下模式中逗号后只允许 `X` 或 `Y`：
```
abs,X   abs,Y
zp,X    (zp,X)   (zp),Y
(operand),X|Y   operand,X|Y
```
若出现其它单字母（例如 `,A` / `,Q` / `,Z`），会被标红（`invalid.illegal.index.register.6502-asm`）。

## 自定义配色示例
在 `settings.json` 中：
```jsonc
"editor.tokenColorCustomizations": {
	"textMateRules": [
		{ "scope": "punctuation.separator.addressing.comma.6502-asm", "settings": { "foreground": "#FFAA33" } },
		{ "scope": ["punctuation.addressing.paren.open.6502-asm","punctuation.addressing.paren.close.6502-asm"], "settings": { "foreground": "#888888" } },
		{ "scope": "variable.language.register.index.6502-asm", "settings": { "foreground": "#4FC3F7", "fontStyle": "bold" } },
		{ "scope": "invalid.illegal.index.register.6502-asm", "settings": { "foreground": "#FFFFFF", "background": "#D32F2F", "fontStyle": "bold" } },
		{ "scope": "constant.numeric.hex.6502-asm", "settings": { "foreground": "#C792EA" } }
	]
}
```

## 典型示例
```asm
; 立即数
LDA #$10
; 绝对 & 索引
LDA $63C2,X
LDA $63C2,Y
; 间接
LDA ($20,X)
LDA ($20),Y
; 宏
MYMAC  MACRO ?1
		LDA #?1
ENDM
; 符号赋值
BUF_BASE = $2000
LDA BUF_BASE,Y
; 非法索引示例（会标红）
LDA $1000,A
```

## 使用方法
1. 克隆或复制本扩展文件夹。
2. VS Code 中按 F5 进入扩展开发主机调试；或使用 `vsce package` 打包后安装 vsix。
3. 打开 `.asm` / `.65s` 文件即可获得高亮与悬停提示。
4. 将鼠标放在指令（如 `LDA`、`JSR`）上即可看到 Markdown 信息面板。

### 扩展 / 修改悬停指令说明
编辑根目录 `extension.js` 中 `INSTRUCTION_INFO` 对象，按现有格式新增或调整：
```js
INSTRUCTION_INFO.MYINST = {
	brief: '功能简述',
	flags: '受影响标志，如 N Z C',
	modes: '支持的寻址模式列表',
	example: 'MYINST $1234'
};
```
保存后重启扩展调试主机即可生效。

## 发布者
- 作者: Lion  (chengbin@3578.cn)
- 网址: www.3578.cn
- GitHub: https://github.com/ZhenHena

## 反馈
欢迎提交 Issue / PR 优化更多 6502 / SB2000 特殊指令、脚本或语义增强（比如潜在跨页提示、表达式寻址更精细拆分等）。
