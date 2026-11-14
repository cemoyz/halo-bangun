export function formatIDR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return 'Rp 0';
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num) || !isFinite(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function terbilang(angka: number | string | null | undefined): string {
  if (angka === null || angka === undefined || angka === '') return 'Nol Rupiah';
  const num = typeof angka === 'number' ? angka : Number(angka);
  if (isNaN(num) || !isFinite(num)) return 'Nol Rupiah';

  const isNegatif = num < 0;
  const bilangan = Math.floor(Math.abs(num));
  if (bilangan === 0) return 'Nol Rupiah';

  const kata = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  function konversi(n: number): string {
    if (n < 12) {
      return kata[n];
    } else if (n < 20) {
      return konversi(n - 10) + ' Belas';
    } else if (n < 100) {
      return konversi(Math.floor(n / 10)) + ' Puluh ' + konversi(n % 10);
    } else if (n < 200) {
      return 'Seratus ' + konversi(n - 100);
    } else if (n < 1000) {
      return konversi(Math.floor(n / 100)) + ' Ratus ' + konversi(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + konversi(n - 1000);
    } else if (n < 1000000) {
      return konversi(Math.floor(n / 1000)) + ' Ribu ' + konversi(n % 1000);
    } else if (n < 1000000000) {
      return konversi(Math.floor(n / 1000000)) + ' Juta ' + konversi(n % 1000000);
    } else if (n < 1000000000000) {
      return konversi(Math.floor(n / 1000000000)) + ' Miliar ' + konversi(n % 1000000000);
    } else {
      return konversi(Math.floor(n / 1000000000000)) + ' Triliun ' + konversi(n % 1000000000000);
    }
  }

  const hasil = konversi(bilangan).replace(/\s+/g, ' ').trim();
  const prefix = isNegatif ? 'Minus ' : '';
  return prefix + hasil + ' Rupiah';
}
