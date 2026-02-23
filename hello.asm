.model small
.stack 100h
.data
    msg db 'Hello!$'
.code
start:
    mov ax, @data
    mov ds, ax
    mov ah, 09h
    mov dx, offset msg
    int 21h
    mov ax, 4c00h
    int 21h
end start