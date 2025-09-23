; --------------------------------------------------------------------------
; 名称: 显示命令行参数
; 说明: 从系统命令行读取第一个参数，显示到屏幕并等待按键
; 作者: Lion
; 邮箱: chengbin@3578.cn
; 日期: 2025-09-23
; 备注: 适配 cc65 汇编与 sb2k.cfg 链接脚本
; --------------------------------------------------------------------------
.segment "CODE"
	JMP START
	.byte $AA, $55, $00, $00, $00

; --------------------------------
; 程序入口
; --------------------------------
START:
	; 背景色绿色
	LDA #$09
	STA $2040

	; 设置显示起始列为第 1 列（靠左）
	LDA #1
	STA $630C

	; 读取命令行参数到缓冲区 PARAMBUF
	JSR GetParam

	; 显示参数（PRINT 例程需要在 $4B/$4C 中传入地址）
	LDA #<PARAMBUF
	STA $4B
	LDA #>PARAMBUF
	STA $4C
	JSR PRINT

	; 等待按键
	JMP WAIT_ANYKEY

; --------------------------------
; 打印字符串到屏幕（使用 BIOS 例程 $FFF0）
; 输入: A = $25, $63E/$642/$0C/$0D 为参数
; --------------------------------
PRINT:
	LDA #$25
	STA $63E
	LDA #$00
	STA $0642
	LDA #$55
	STA $000C
	LDA #$82
	STA $000D
	JSR $FFF0
	RTS

; --------------------------------
; 等待任意键（使用 BIOS 例程 $FFF0）
; --------------------------------
WAIT_ANYKEY:
	LDA #$6D
	STA $63E
	LDA #$0A
	STA $63F
	JSR $FFF0
	RTS

; --------------------------------
; 从 $6364 获取第一个参数到 PARAMBUF
; --------------------------------
GetParam:
	LDY #$00		; 从偏移 0 开始
SkipSpaces:
	LDA $6364,Y
	BEQ NoParam		; 空字符串
	CMP #$20
	BNE StartCopy
	INY
	BNE SkipSpaces

StartCopy:
	LDX #$00		; X 作目标缓冲区偏移
CopyLoop:
	LDA $6364,Y
	BEQ EndCopy		; 到结尾
	CMP #$20
	BEQ EndCopy		; 遇到空格也结束
	CPX #31			; 检查是否达到缓冲区上限（保留一个字节给终止符）
	BEQ EndCopy
	STA PARAMBUF,X		; 存到目标缓冲区
	INX
	INY
	BNE CopyLoop

EndCopy:
	LDA #$00
	STA PARAMBUF,X		; 写入结束符
	RTS

NoParam:
	LDA #$00
	STA PARAMBUF
	RTS

; --------------------------------
; 数据区
; --------------------------------
.segment "BSS"
PARAMBUF:
	.res 32, 0

; --------------------------------------------------------------------------
; 中断/复位向量区（适配 sb2k.cfg）
; --------------------------------------------------------------------------
.segment "VECTORS"
	.word 0	; NMI
	.word START	; RESET
	.word 0	; IRQ