import { apiEndpoint } from '../config'
import { Vocab } from '../types/Vocab';
import { CreateVocabRequest } from '../types/CreateVocabRequest';
import Axios from 'axios'
import { UpdateVocabRequest } from '../types/UpdateVocabRequest';

export async function getVocabs(idToken: string): Promise<Vocab[]> {
  console.log('Fetching vocabs')

  const response = await Axios.get(`${apiEndpoint}/vocabs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Vocabs:', response.data)
  return response.data.items
}

export async function createVocab(
  idToken: string,
  newVocab: CreateVocabRequest
): Promise<Vocab> {
  const response = await Axios.post(`${apiEndpoint}/vocabs`,  JSON.stringify(newVocab), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchVocab(
  idToken: string,
  vocabId: string,
  updatedVocab: UpdateVocabRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/vocabs/${vocabId}`, JSON.stringify(updatedVocab), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteVocab(
  idToken: string,
  vocabId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/vocabs/${vocabId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  vocabId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/vocabs/${vocabId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
