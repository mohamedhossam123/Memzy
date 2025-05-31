// lib/api/humor.ts
export interface HumorTypesResponse {
  humorTypes?: string[]
}

export interface UserHumorResponse {
  humorTypes?: string[]
  HumorTypes?: string[]
}

export class HumorAPI {
  private baseURL: string
  private token: string

  constructor(token: string) {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL!
    this.token = token
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }
  }

  async getAllHumorTypes(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/api/UserHumor/GetAllHumorTypes`, {
      headers: { Authorization: `Bearer ${this.token}` }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch humor types')
    }
    
    const data: HumorTypesResponse = await response.json()
    return data.humorTypes || []
  }

  async getUserHumor(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/api/UserHumor/GetUserHumor`, {
      headers: { Authorization: `Bearer ${this.token}` }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user humor')
    }
    
    const data = await response.json()
    const userHumorTypes = Array.isArray(data) 
      ? data 
      : data.humorTypes || data.HumorTypes || []
    
    return userHumorTypes
  }

  async setHumor(humorTypes: string[]): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/UserHumor/SetHumor`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ humorTypes })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update humor preferences')
    }
  }
}