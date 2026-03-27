import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    console.log('Yeni mesaj:', { name, email, message });

    return NextResponse.json(
      { success: true, message: 'Mesaj başarıyla gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
