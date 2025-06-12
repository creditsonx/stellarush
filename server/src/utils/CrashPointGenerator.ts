import crypto from 'crypto';

export class CrashPointGenerator {
  private serverSeed: string;
  private nonce: number = 0;

  constructor() {
    this.serverSeed = this.generateServerSeed();
  }

  private generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public generateCrashPoint(): number {
    // Generate a provably fair crash point
    const hash = crypto
      .createHmac('sha256', this.serverSeed)
      .update(`${this.nonce}`)
      .digest('hex');

    this.nonce++;

    // Convert hash to crash point using provably fair algorithm
    return this.hashToCrashPoint(hash);
  }

  private hashToCrashPoint(hash: string): number {
    // Take first 8 characters of hash
    const hex = hash.slice(0, 8);
    const num = parseInt(hex, 16);

    // Convert to crash point between 1.00x and ~100x
    // Using exponential distribution for realistic game feel
    const e = Math.pow(2, 32);
    const crashPoint = Math.floor((100 * e - num) / (e - num)) / 100;

    // Ensure minimum crash point of 1.01x
    return Math.max(1.01, Math.min(crashPoint, 1000));
  }

  public getServerSeed(): string {
    return this.serverSeed;
  }

  public getNonce(): number {
    return this.nonce;
  }

  // For game verification
  public verifyCrashPoint(serverSeed: string, nonce: number, expectedCrashPoint: number): boolean {
    const hash = crypto
      .createHmac('sha256', serverSeed)
      .update(`${nonce}`)
      .digest('hex');

    const calculatedCrashPoint = this.hashToCrashPoint(hash);
    return Math.abs(calculatedCrashPoint - expectedCrashPoint) < 0.01;
  }
}
