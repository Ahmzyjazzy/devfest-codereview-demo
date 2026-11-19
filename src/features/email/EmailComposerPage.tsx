import { useEffect, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { Label } from '@/components/ui/input'
import {
  PrimaryButton,
  QuietButton,
  Segmented,
  SheetTable,
} from '@/components/ui/list-kit'
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import type { Lead } from '@/types'

const EMAIL_TYPES = ['Follow-up', 'Introduction', 'Proposal', 'Thank You'] as const

type EmailType = (typeof EMAIL_TYPES)[number]

interface GeneratedEmail {
  subject: string
  body: string
}

export function EmailComposerPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [emailType, setEmailType] = useState<EmailType>('Follow-up')
  const [generating, setGenerating] = useState(false)
  const [email, setEmail] = useState<GeneratedEmail | null>(null)

  useEffect(() => {
    api
      .listLeads()
      .then(setLeads)
      .catch(() => toast.error('Could not load leads'))
  }, [])

  const selectedLead = leads.find(l => String(l.id) === selectedLeadId)

  const generateEmail = async () => {
    if (!selectedLead) {
      toast.error('Pick a lead first')
      return
    }
    setGenerating(true)
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

      const prompt = `Write a professional sales email from Ade's Kitchen, a catering business in Ibadan, Nigeria.
      Type: ${emailType}
      Recipient Name: ${selectedLead.name}
      Recipient Company: ${selectedLead.company || 'their business'}
      Context (Notes): ${selectedLead.notes || 'None'}
      Use naira (₦) for any amounts.

      Respond STRICTLY in JSON format with exactly two keys: "subject" and "body".
      Do not include any other text or markdown block formatting.`

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      })

      const text = response.text
      if (!text) throw new Error('No response text')
      const parsed = JSON.parse(
        text.replace(/^```json\s*/, '').replace(/\s*```$/, ''),
      )
      if (!parsed.subject || !parsed.body) {
        throw new Error('Invalid response format')
      }
      setEmail({ subject: parsed.subject, body: parsed.body })
    } catch (error) {
      console.error('Email generation error:', error)
      toast.error('Could not generate the email. Check your API key.')
    } finally {
      setGenerating(false)
    }
  }

  const copyEmail = async () => {
    if (!email) return
    await navigator.clipboard.writeText(
      `Subject: ${email.subject}\n\n${email.body}`,
    )
    toast.success('Email copied')
  }

  return (
    <>
      <PageHeader
        title="Email composer"
        subtitle="Draft a personalised email to a lead with AI."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-5 rounded-well bg-gray-100 p-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email-lead">Lead</Label>
            <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
              <SelectTrigger id="email-lead" className="bg-surface">
                <SelectValue placeholder="Select a lead" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {leads.map(l => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                    {l.company ? ` · ${l.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium text-gray-700">Email type</span>
            <Segmented
              options={EMAIL_TYPES.map(t => ({ key: t, label: t }))}
              value={emailType}
              onChange={setEmailType}
            />
          </div>

          <PrimaryButton
            icon="magic-wand-3"
            onClick={generateEmail}
            disabled={!selectedLead || generating}
          >
            {generating ? 'Writing…' : 'Generate email'}
          </PrimaryButton>
        </div>

        <SheetTable
          title="Generated email"
          action={
            email && (
              <div className="flex gap-2">
                <QuietButton icon="refresh" onClick={generateEmail} disabled={generating}>
                  Regenerate
                </QuietButton>
                <QuietButton icon="copy" onClick={copyEmail}>
                  Copy
                </QuietButton>
              </div>
            )
          }
        >
          <div className="min-h-64 p-5">
            {generating ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : email ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Subject:{' '}
                  <span className="font-medium text-gray-900">{email.subject}</span>
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                  {email.body}
                </p>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-gray-500">
                Pick a lead and an email type, then generate a draft.
              </p>
            )}
          </div>
        </SheetTable>
      </div>
    </>
  )
}
