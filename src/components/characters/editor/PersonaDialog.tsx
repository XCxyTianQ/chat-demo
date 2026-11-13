import { useState } from 'react'
import { Button } from '../../base/Button.js'
import { Modal } from '../../base/Modal.js'
import { showToast } from '../../base/toastState.js'
import { closePersona, useRpUi } from '../../shell/uiState.js'
import { personaAvatar } from '../../../services/characters/avatar.js'
import { setPersona, useCharacters } from '../../../services/characters/store.js'
import { STRINGS } from './strings.js'
import styles from './PersonaDialog.module.css'

/** 人格面板：全局唯一的一份「我是谁」，角色据此称呼你。 */
export const PersonaDialog = () => {
  const open = useRpUi((state) => state.personaOpen)
  return open ? <PersonaContent /> : null
}

const PersonaContent = () => {
  const persona = useCharacters((state) => state.persona)
  const [name, setName] = useState(persona.name)
  const [description, setDescription] = useState(persona.description)
  const [busy, setBusy] = useState(false)

  const close = () => {
    if (!busy) {
      closePersona()
    }
  }

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      showToast(STRINGS.personaNameRequired)
      return
    }
    setBusy(true)
    try {
      await setPersona({ ...persona, name: trimmed, description: description.trim() })
      showToast(STRINGS.personaSaved)
      closePersona()
    } catch {
      showToast(STRINGS.personaSaveFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title={STRINGS.personaTitle}
      closable
      className={styles.dialog}
      mainClassName={styles.content}
      onClose={close}
      footer={
        <>
          <Button variant="outlined" size="m" disabled={busy} onClick={close}>
            {STRINGS.cancel}
          </Button>
          <Button variant="primary" size="m" disabled={busy} onClick={() => void save()}>
            {busy ? STRINGS.saving : STRINGS.save}
          </Button>
        </>
      }
    >
      <div className={styles.preview}>
        <img
          className={styles.avatar}
          src={personaAvatar(name.trim() || persona.name, persona.avatar)}
          alt=""
        />
        <div className={styles.previewText}>
          <span className={styles.previewName}>
            {name.trim() || STRINGS.personaNamePlaceholder}
          </span>
          <span className={styles.previewHint}>{STRINGS.personaHint}</span>
        </div>
      </div>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{STRINGS.personaNameLabel}</span>
        <input
          className={styles.input}
          value={name}
          placeholder={STRINGS.personaNamePlaceholder}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{STRINGS.personaDescriptionLabel}</span>
        <textarea
          className={styles.textarea}
          rows={4}
          value={description}
          placeholder={STRINGS.personaDescriptionHint}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
    </Modal>
  )
}
