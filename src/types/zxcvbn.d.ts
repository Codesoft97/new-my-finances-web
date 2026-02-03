declare module 'zxcvbn' {
  interface ZXCVBNResult {
    score: 0 | 1 | 2 | 3 | 4;
    guesses: number;
    guesses_log10: number;
    calc_time: number;
    crack_times_seconds: {
      online_throttling_100_per_hour: number;
      online_no_throttling_10_per_second: number;
      offline_slow_hashing_1e4_per_second: number;
      offline_fast_hashing_1e10_per_second: number;
    };
    crack_times_display: {
      online_throttling_100_per_hour: string;
      online_no_throttling_10_per_second: string;
      offline_slow_hashing_1e4_per_second: string;
      offline_fast_hashing_1e10_per_second: string;
    };
    feedback: {
      warning: string;
      suggestions: string[];
    };
    sequence: Array<{
      pattern: string;
      token: string;
      i: number;
      j: number;
    }>;
    password: string;
  }

  function zxcvbn(password: string, userInputs?: string[]): ZXCVBNResult;
  export = zxcvbn;
}
