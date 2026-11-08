import { test, expect } from './fixtures';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

test('contact QR decodes to Steven’s vCard', async ({ page }) => {
  await page.goto('es/?contact=1');
  const qr = page.locator('.contact__qr-code');
  await expect(qr).toBeVisible();
  const png = PNG.sync.read(await qr.screenshot());
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(code, 'QR could not be decoded').not.toBeNull();
  const text = code!.data;
  expect(text).toContain('BEGIN:VCARD');
  expect(text).toContain('FN:Steven E Espinoza M');
  expect(text).toContain('steven.espinoza0604@gmail.com');
  expect(text).toContain('+573007242261');
  expect(text).toContain('END:VCARD');
});

test('vCard download is served and well formed', async ({ request, page }) => {
  const r = await request.get('steven-espinoza.vcf');
  expect(r.status()).toBe(200);
  const body = await r.text();
  expect(body.startsWith('BEGIN:VCARD')).toBe(true);
  expect(body).toMatch(/VERSION:3\.0/);
  expect(body).toMatch(/TEL;TYPE=CELL:\+573007242261/);
  expect(body).toMatch(/URL;TYPE=LinkedIn:https:\/\/www\.linkedin\.com\/in\/seem1010\//);
  expect(body.trim().endsWith('END:VCARD')).toBe(true);

  await page.goto('es/?contact=1');
  const link = page.locator('.contact__vcf');
  await expect(link).toHaveAttribute('download', 'steven-espinoza.vcf');
});
