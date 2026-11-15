import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chartColor, chartPalette, relativeWidth } from '../ui/theme';

const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf-8');

describe('оформление', () => {
  it('объявляет unicode-range для каждого подмножества шрифта', () => {
    const faces = styles.split('@font-face').slice(1);
    expect(faces.length).toBeGreaterThan(0);

    for (const face of faces) {
      expect(face).toContain('font-family:');
      expect(face).toMatch(/unicode-range:/);
    }
  });

  it('покрывает кириллицу, латиницу и знак валюты диапазонами', () => {
    const ranges = [...styles.matchAll(/unicode-range:\s*([^;]+);/g)].map((match) => match[1]);
    const joined = ranges.join(',');

    expect(joined).toContain('U+0400-045F');
    expect(joined).toContain('U+0000-00FF');
    // Знак рубля U+20BD лежит в диапазоне U+20AD-20C0 (latin-ext)
    expect(joined).toContain('U+20AD-20C0');
  });

  it('оценивает ширину суммы в долях кегля', () => {
    const digits = relativeWidth('111 111,11');
    // 8 цифр по 0.6484em, два пробела и запятая
    expect(digits).toBeGreaterThan(8 * 0.64);
    expect(digits).toBeLessThan(8 * 0.66 + 1);

    // Более длинная строка — шире
    expect(relativeWidth('1 234 567,89 RUB')).toBeGreaterThan(digits);
  });

  it('даёт разные цвета секторам диаграммы и точкам легенды', () => {
    const colors = Array.from({ length: 20 }, (_, index) => chartColor(index));

    expect(new Set(colors).size).toBe(colors.length);
    expect(colors.slice(0, chartPalette.length)).toEqual([...chartPalette]);
  });
});
