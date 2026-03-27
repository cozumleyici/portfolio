import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Veri bulunamadı' },
        { status: 400 }
      );
    }

    // Burada veritabanına kaydetme işlemi yapılacak
    // Şimdilik sadece localStorage'a kaydediyoruz
    console.log('Portfolio data güncellendi:', data);

    // Gerçek uygulamada burada MongoDB'ye kaydetme işlemi yapılır
    // await Portfolio.findOneAndUpdate({}, data, { upsert: true });

    return NextResponse.json(
      { success: true, message: 'Veriler başarıyla kaydedildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Veri kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Veri kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Burada veritabanından okuma işlemi yapılacak
    // Şimdilik varsayılan verileri döndürüyoruz
    return NextResponse.json(
      { message: 'Admin API çalışıyor' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    return NextResponse.json(
      { error: 'Veriler okunurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
