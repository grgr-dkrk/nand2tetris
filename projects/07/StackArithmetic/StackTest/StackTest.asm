// push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
// eq
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE0
D;JEQ
D=0
@SP
A=M
M=D
@SP
M=M+1
@END1
0;JMP
(TRUE0)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END1)
// push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 16
@16
D=A
@SP
A=M
M=D
@SP
M=M+1
// eq
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE1
D;JEQ
D=0
@SP
A=M
M=D
@SP
M=M+1
@END2
0;JMP
(TRUE1)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END2)
// push constant 16
@16
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 17
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
// eq
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE2
D;JEQ
D=0
@SP
A=M
M=D
@SP
M=M+1
@END3
0;JMP
(TRUE2)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END3)
// push constant 892
@892
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
// lt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE3
D;JLT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END4
0;JMP
(TRUE3)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END4)
// push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 892
@892
D=A
@SP
A=M
M=D
@SP
M=M+1
// lt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE4
D;JLT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END5
0;JMP
(TRUE4)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END5)
// push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 891
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
// lt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE5
D;JLT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END6
0;JMP
(TRUE5)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END6)
// push constant 32767
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
// gt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE6
D;JGT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END7
0;JMP
(TRUE6)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END7)
// push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 32767
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1
// gt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE7
D;JGT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END8
0;JMP
(TRUE7)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END8)
// push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 32766
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
// gt
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@TRUE8
D;JGT
D=0
@SP
A=M
M=D
@SP
M=M+1
@END9
0;JMP
(TRUE8)
D=-1
@SP
A=M
M=D
@SP
M=M+1
(END9)
// push constant 57
@57
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 31
@31
D=A
@SP
A=M
M=D
@SP
M=M+1
// push constant 53
@53
D=A
@SP
A=M
M=D
@SP
M=M+1
// add
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A+D
@SP
A=M
M=D
@SP
M=M+1
// push constant 112
@112
D=A
@SP
A=M
M=D
@SP
M=M+1
// sub
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=A-D
@SP
A=M
M=D
@SP
M=M+1
// neg
@SP
A=M-1
M=-M
@SP
AM=M-1
D=M
// and
@SP
AM=M-1
A=M
D=D&A
@SP
A=M
M=D
@SP
M=M+1
// push constant 82
@82
D=A
@SP
A=M
M=D
@SP
M=M+1
// or
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D|M
@SP
M=M+1
// not
@SP
AM=M-1
M=!M
@SP
M=M+1