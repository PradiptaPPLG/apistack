import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, method, headers, requestBody } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const options: RequestInit = {
      method: method || 'GET',
      headers: headers || {},
    }

    if (['POST', 'PUT', 'PATCH'].includes(options.method as string) && requestBody) {
      options.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody)
    }

    const response = await fetch(url, options)
    const status = response.status
    const text = await response.text()

    let responseData
    try {
      responseData = JSON.parse(text)
    } catch {
      responseData = text
    }

    return NextResponse.json(
      {
        status,
        data: responseData,
      },
      { status: 200 } // Always return 200 to our client, containing the actual status inside
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        error: error.message ?? 'Failed to proxy request',
      },
      { status: 200 }
    )
  }
}
