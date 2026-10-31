import { describe, expect, it } from 'vitest';
import { angleDiff, bearing, curvatureDrop, distance, elevationAngle, normalizeDeg } from '../src/geo.ts';

describe('distance', () => {
  it('one degree of latitude is about 111.19 km', () => {
    expect(distance({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111_195, -1);
  });

  it('is zero for the same point', () => {
    expect(distance({ lat: 27.7, lon: 85.3 }, { lat: 27.7, lon: 85.3 })).toBe(0);
  });
});

describe('bearing', () => {
  const origin = { lat: 0, lon: 0 };
  it.each([
    [{ lat: 1, lon: 0 }, 0],
    [{ lat: 0, lon: 1 }, 90],
    [{ lat: -1, lon: 0 }, 180],
    [{ lat: 0, lon: -1 }, 270],
  ])('points the right way to %o', (target, expected) => {
    expect(bearing(origin, target)).toBeCloseTo(expected, 6);
  });
});

describe('curvatureDrop', () => {
  it('is about 785 m at 100 km without refraction', () => {
    expect(curvatureDrop(100_000, 0)).toBeCloseTo(784.8, 0);
  });

  it('is about 683 m at 100 km with refraction', () => {
    expect(curvatureDrop(100_000)).toBeCloseTo(682.8, 0);
  });
});

describe('elevationAngle', () => {
  it('a 1000 m hill 10 km away is almost atan(0.1) ≈ 5.71°, a bit less due to curvature', () => {
    expect(elevationAngle(0, 1000, 10_000)).toBeCloseTo(5.672, 2);
  });

  it('a far peak at the same height as you sits below eye level', () => {
    expect(elevationAngle(5000, 5000, 100_000)).toBeLessThan(0);
  });
});

describe('angle helpers', () => {
  it('normalizeDeg wraps negatives and big numbers', () => {
    expect(normalizeDeg(-10)).toBe(350);
    expect(normalizeDeg(370)).toBe(10);
  });

  it('angleDiff takes the short way round', () => {
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(10, 350)).toBe(-20);
  });
});
