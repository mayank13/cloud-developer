export interface VocabItem {
  userId: string
  vocabId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
