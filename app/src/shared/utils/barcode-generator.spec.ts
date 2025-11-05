import { describe, it, expect } from 'vitest'
import { BarcodeGenerator } from './barcode-generator'

describe('BarcodeGenerator', () => {
  describe('generate', () => {
    it('should generate barcode with correct format', () => {
      const barcode = BarcodeGenerator.generate({
        originalCode: '1234567890',
        supplierId: 'ACME'
      })

      expect(barcode).toMatch(/^INV-ACME-[A-Z0-9]{6,8}-[A-Z0-9]{4}$/)
    })

    it('should handle missing supplier ID', () => {
      const barcode = BarcodeGenerator.generate({
        originalCode: '1234567890'
      })

      expect(barcode).toMatch(/^INV-UNKN-[A-Z0-9]{6,8}-[A-Z0-9]{4}$/)
    })

    it('should pad short supplier IDs', () => {
      const barcode = BarcodeGenerator.generate({
        originalCode: '1234567890',
        supplierId: 'AB'
      })

      expect(barcode).toMatch(/^INV-00AB-/)
    })

    it('should truncate long supplier IDs', () => {
      const barcode = BarcodeGenerator.generate({
        originalCode: '1234567890',
        supplierId: 'VERYLONGSUPPLIER'
      })

      expect(barcode).toMatch(/^INV-VERY-/)
    })

    it('should generate different timestamps for different calls', () => {
      const barcode1 = BarcodeGenerator.generate({ originalCode: '123' })
      const barcode2 = BarcodeGenerator.generate({ originalCode: '123' })

      // Timestamps might be the same if called very quickly,
      // but checksums should differ
      expect(barcode1).not.toBe(barcode2)
    })
  })

  describe('validate', () => {
    it('should validate correct format', () => {
      const barcode = 'INV-ACME-1K2M3N4P-5A6B'
      expect(BarcodeGenerator.validate(barcode)).toBe(true)
    })

    it('should reject invalid prefix', () => {
      expect(BarcodeGenerator.validate('ABC-ACME-1K2M3N4P-5A6B')).toBe(false)
    })

    it('should reject wrong supplier length', () => {
      expect(BarcodeGenerator.validate('INV-AC-1K2M3N4P-5A6B')).toBe(false)
      expect(BarcodeGenerator.validate('INV-ACMEE-1K2M3N4P-5A6B')).toBe(false)
    })

    it('should reject wrong timestamp length', () => {
      expect(BarcodeGenerator.validate('INV-ACME-123-5A6B')).toBe(false)
    })

    it('should reject wrong checksum length', () => {
      expect(BarcodeGenerator.validate('INV-ACME-1K2M3N4P-5A')).toBe(false)
    })

    it('should reject invalid characters', () => {
      expect(BarcodeGenerator.validate('INV-ACME-1K2M3N4P-5@6B')).toBe(false)
    })
  })

  describe('parse', () => {
    it('should parse valid barcode', () => {
      const barcode = 'INV-ACME-1K2M3N4P-5A6B'
      const parsed = BarcodeGenerator.parse(barcode)

      expect(parsed).not.toBeNull()
      expect(parsed?.prefix).toBe('INV')
      expect(parsed?.supplierId).toBe('ACME')
      expect(parsed?.timestamp).toBeTypeOf('number')
      expect(parsed?.checksum).toBe('5A6B')
    })

    it('should return null for invalid barcode', () => {
      const parsed = BarcodeGenerator.parse('INVALID-BARCODE')
      expect(parsed).toBeNull()
    })

    it('should decode timestamp correctly', () => {
      const generated = BarcodeGenerator.generate({ originalCode: '123' })
      const parsed = BarcodeGenerator.parse(generated)

      expect(parsed).not.toBeNull()
      expect(parsed?.timestamp).toBeGreaterThan(0)
      expect(parsed?.timestamp).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = BarcodeGenerator.generateUniqueId()
      const id2 = BarcodeGenerator.generateUniqueId()

      expect(id1).not.toBe(id2)
    })

    it('should match expected format', () => {
      const id = BarcodeGenerator.generateUniqueId()
      expect(id).toMatch(/^\d+-[a-z0-9]{7}$/)
    })
  })
})
