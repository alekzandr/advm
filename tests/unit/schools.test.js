// School/discipline data tests
import { describe, it, expect } from 'vitest';
import { SCHOOL_PROFILES, listDisciplines, getDisciplineInfo } from '../../src/js/data/schools.js';

describe('School Profiles', () => {
  describe('SCHOOL_PROFILES constant', () => {
    it('should have all 8 D&D schools', () => {
      const schools = Object.keys(SCHOOL_PROFILES);
      expect(schools).toContain('abjuration');
      expect(schools).toContain('conjuration');
      expect(schools).toContain('divination');
      expect(schools).toContain('enchantment');
      expect(schools).toContain('evocation');
      expect(schools).toContain('illusion');
      expect(schools).toContain('necromancy');
      expect(schools).toContain('transmutation');
    });

    it('should have exactly 8 schools', () => {
      expect(Object.keys(SCHOOL_PROFILES)).toHaveLength(8);
    });

    it('should have name and color for each school', () => {
      Object.entries(SCHOOL_PROFILES).forEach(([key, value]) => {
        expect(value).toHaveProperty('name');
        expect(value).toHaveProperty('color');
        expect(typeof value.name).toBe('string');
        expect(typeof value.color).toBe('string');
      });
    });

    it('should have proper capitalization in names', () => {
      Object.values(SCHOOL_PROFILES).forEach(school => {
        expect(school.name[0]).toBe(school.name[0].toUpperCase());
      });
    });

    it('should have valid hex colors', () => {
      Object.values(SCHOOL_PROFILES).forEach(school => {
        expect(school.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('listDisciplines()', () => {
    it('should return array of discipline keys', () => {
      const disciplines = listDisciplines();
      expect(Array.isArray(disciplines)).toBe(true);
      expect(disciplines.length).toBe(8);
    });

    it('should return lowercase keys', () => {
      const disciplines = listDisciplines();
      disciplines.forEach(d => {
        expect(d).toBe(d.toLowerCase());
      });
    });
  });

  describe('getDisciplineInfo()', () => {
    it('should return school info for valid discipline', () => {
      const info = getDisciplineInfo('evocation');
      expect(info).toBeTruthy();
      expect(info.name).toBe('Evocation');
      expect(info.color).toBeTruthy();
    });

    it('should return null for invalid discipline', () => {
      const info = getDisciplineInfo('invalid');
      expect(info).toBeNull();
    });

    it('should return null for undefined', () => {
      const info = getDisciplineInfo();
      expect(info).toBeNull();
    });
  });
});
