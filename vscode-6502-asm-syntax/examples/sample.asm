; 示例: 6502 语法高亮特性覆盖
; 宏 (老风格)
MYMACRO MACRO ?1 ?2
    LDA ?1
    STA ?2
ENDM
MYMACRO $10 $20

; ca65 宏
.macro LOADSTORE src,dst
    LDA src
    STA dst
.endmacro
LOADSTORE $30,$40

; 符号赋值与表达式
BUFFER_SIZE = $200 + 32
.if BUFFER_SIZE >= $210
    LDA #$FF
    STA ($20),Y
    LDA TABLE,X
.else
    LDA #%10101010
    LDA 3Ah
.endif

; 标签类型
.loop:
+:
-:
1:
TABLE .byte 1,2,3

; 寻址模式组合
LDA #$10
LDA VALUE,X
LDA VALUE,Y
LDA (PTR,X)
LDA (PTR),Y

; 零页示例
ZPVAR = $0A
LDA ZPVAR
LDA $0A

; ca65 宏参数引用
.macro ADD2 a,b
    CLC
    LDA a
    ADC b
.endmacro
ADD2 $01,$02

VALUE .word $1234
PTR .word $0040
