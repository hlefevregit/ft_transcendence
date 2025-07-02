// src/components/LiveChat/ChatInput.tsx
import { useState, KeyboardEvent } from 'react'
import { MdSend } from 'react-icons/md'
import '@/styles/LiveChat/ChatInput.css'
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('')

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') send()
  }

  return (
    <div className="chat-input-container">
      <input
      type="text"
      className="chat-input-field"
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={disabled ? '...' : t('type_a_message')}
      />
      <button
      onClick={send}
      disabled={disabled}
      className="chat-input-button"
      aria-label="Send"
      >
      <MdSend size={20} />
      </button>
    </div>
  )
}
