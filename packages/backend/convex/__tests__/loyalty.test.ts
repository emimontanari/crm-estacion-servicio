import { describe, it, expect } from 'vitest'

/**
 * Tests para la lógica de lealtad y puntos
 */

describe('Loyalty System - Business Logic', () => {
  describe('Points calculation', () => {
    it('should calculate points from purchase amount', () => {
      const calculatePoints = (amount: number, rate: number = 0.01): number => {
        return Math.floor(amount * rate * 100)
      }

      // 1% de $100 = 1 punto
      expect(calculatePoints(100, 0.01)).toBe(1)
      // 1% de $1000 = 10 puntos
      expect(calculatePoints(1000, 0.01)).toBe(10)
      // 2% de $100 = 2 puntos
      expect(calculatePoints(100, 0.02)).toBe(2)
    })

    it('should round down points to integer', () => {
      const calculatePoints = (amount: number): number => {
        return Math.floor(amount * 0.01 * 100)
      }

      expect(calculatePoints(99.9)).toBe(0)
      expect(calculatePoints(150.5)).toBe(1)
      expect(calculatePoints(250.9)).toBe(2)
    })
  })

  describe('Tier calculation', () => {
    it('should determine tier based on total points', () => {
      const getTier = (totalPoints: number): string => {
        if (totalPoints >= 10000) return 'platinum'
        if (totalPoints >= 5000) return 'gold'
        if (totalPoints >= 1000) return 'silver'
        return 'bronze'
      }

      expect(getTier(0)).toBe('bronze')
      expect(getTier(500)).toBe('bronze')
      expect(getTier(1000)).toBe('silver')
      expect(getTier(2500)).toBe('silver')
      expect(getTier(5000)).toBe('gold')
      expect(getTier(7500)).toBe('gold')
      expect(getTier(10000)).toBe('platinum')
      expect(getTier(20000)).toBe('platinum')
    })

    it('should calculate tier benefits', () => {
      const getTierBenefits = (tier: string) => {
        const benefits: Record<string, { discount: number; pointsMultiplier: number }> = {
          'bronze': { discount: 0, pointsMultiplier: 1 },
          'silver': { discount: 0.05, pointsMultiplier: 1.5 },
          'gold': { discount: 0.10, pointsMultiplier: 2 },
          'platinum': { discount: 0.15, pointsMultiplier: 3 },
        }
        return benefits[tier] || benefits['bronze']
      }

      expect(getTierBenefits('bronze')).toEqual({ discount: 0, pointsMultiplier: 1 })
      expect(getTierBenefits('silver')).toEqual({ discount: 0.05, pointsMultiplier: 1.5 })
      expect(getTierBenefits('gold')).toEqual({ discount: 0.10, pointsMultiplier: 2 })
      expect(getTierBenefits('platinum')).toEqual({ discount: 0.15, pointsMultiplier: 3 })
    })
  })

  describe('Points redemption', () => {
    it('should calculate discount from points', () => {
      const calculateDiscount = (points: number, conversionRate: number = 0.01): number => {
        return points * conversionRate
      }

      // 100 puntos = $1 de descuento (tasa 0.01)
      expect(calculateDiscount(100, 0.01)).toBe(1)
      // 1000 puntos = $10 de descuento
      expect(calculateDiscount(1000, 0.01)).toBe(10)
      // 500 puntos = $10 de descuento (tasa 0.02)
      expect(calculateDiscount(500, 0.02)).toBe(10)
    })

    it('should validate sufficient points for redemption', () => {
      const canRedeem = (availablePoints: number, requiredPoints: number): boolean => {
        return availablePoints >= requiredPoints && requiredPoints > 0
      }

      expect(canRedeem(100, 50)).toBe(true)
      expect(canRedeem(100, 100)).toBe(true)
      expect(canRedeem(100, 150)).toBe(false)
      expect(canRedeem(100, 0)).toBe(false)
      expect(canRedeem(0, 50)).toBe(false)
    })

    it('should calculate remaining points after redemption', () => {
      const redeemPoints = (
        currentPoints: number,
        pointsToRedeem: number
      ): number => {
        if (currentPoints < pointsToRedeem || pointsToRedeem <= 0) {
          throw new Error('Invalid redemption amount')
        }
        return currentPoints - pointsToRedeem
      }

      expect(redeemPoints(1000, 100)).toBe(900)
      expect(redeemPoints(500, 500)).toBe(0)
      expect(() => redeemPoints(100, 150)).toThrow('Invalid redemption amount')
      expect(() => redeemPoints(100, 0)).toThrow('Invalid redemption amount')
    })
  })

  describe('Points expiration', () => {
    it('should check if points are expired', () => {
      const isExpired = (expirationDate: Date, currentDate: Date = new Date()): boolean => {
        return expirationDate < currentDate
      }

      const pastDate = new Date('2023-01-01')
      const futureDate = new Date('2030-01-01')
      const today = new Date()

      expect(isExpired(pastDate, today)).toBe(true)
      expect(isExpired(futureDate, today)).toBe(false)
    })

    it('should calculate expiration date (1 year from earning)', () => {
      const calculateExpiration = (earnedDate: Date): Date => {
        const expiration = new Date(earnedDate)
        expiration.setFullYear(expiration.getFullYear() + 1)
        return expiration
      }

      const earned = new Date('2024-01-15')
      const expiration = calculateExpiration(earned)

      expect(expiration.getFullYear()).toBe(2025)
      expect(expiration.getMonth()).toBe(earned.getMonth())
      expect(expiration.getDate()).toBe(earned.getDate())
    })

    it('should filter active points (not expired)', () => {
      const pointsTransactions = [
        { id: '1', points: 100, expiresAt: new Date('2030-01-01') },
        { id: '2', points: 200, expiresAt: new Date('2023-01-01') },
        { id: '3', points: 150, expiresAt: new Date('2029-06-15') },
      ]

      const now = new Date('2024-01-01')
      const activePoints = pointsTransactions
        .filter(t => t.expiresAt > now)
        .reduce((sum, t) => sum + t.points, 0)

      expect(activePoints).toBe(250) // 100 + 150
    })
  })

  describe('Loyalty program validation', () => {
    it('should validate minimum purchase for points earning', () => {
      const meetsMinimumPurchase = (
        amount: number,
        minimum: number = 10
      ): boolean => {
        return amount >= minimum
      }

      expect(meetsMinimumPurchase(15, 10)).toBe(true)
      expect(meetsMinimumPurchase(10, 10)).toBe(true)
      expect(meetsMinimumPurchase(5, 10)).toBe(false)
    })

    it('should calculate bonus points for promotions', () => {
      const calculateBonusPoints = (
        basePoints: number,
        bonusPercentage: number = 0
      ): number => {
        return Math.floor(basePoints * (1 + bonusPercentage))
      }

      // Sin bonus
      expect(calculateBonusPoints(100, 0)).toBe(100)
      // 50% bonus
      expect(calculateBonusPoints(100, 0.5)).toBe(150)
      // Doble puntos (100% bonus)
      expect(calculateBonusPoints(100, 1)).toBe(200)
    })
  })
})
