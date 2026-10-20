import Decimal from 'decimal.js'
import type { EthAmount } from '@/types/common'

const ETH_DECIMALS = 18
const ETH_PATTERN = /^\d+(\.\d{1,18})?$/

const Eth = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_DOWN })

function toAmount(value: Decimal): EthAmount {
  return value.toDecimalPlaces(ETH_DECIMALS).toFixed()
}

export function isValidEth(value: string): boolean {
  return ETH_PATTERN.test(value)
}

export function addEth(...values: EthAmount[]): EthAmount {
  return toAmount(values.reduce((sum, value) => sum.plus(value), new Eth(0)))
}

export function subEth(a: EthAmount, b: EthAmount): EthAmount {
  return toAmount(new Eth(a).minus(b))
}

export function mulEth(value: EthAmount, quantity: number): EthAmount {
  if (!Number.isInteger(quantity)) throw new Error('Quantidade deve ser inteira')
  return toAmount(new Eth(value).times(quantity))
}

export function applyBps(value: EthAmount, bps: number): EthAmount {
  return toAmount(new Eth(value).times(bps).div(10_000))
}

export function compareEth(a: EthAmount, b: EthAmount): number {
  return new Eth(a).comparedTo(b)
}

export function formatEth(value: EthAmount, maxDecimals = 4): string {
  return `${new Eth(value).toDecimalPlaces(maxDecimals).toFixed()} ETH`
}
