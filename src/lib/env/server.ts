import "server-only";

type ServerEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type PaymentsEnv = {
  MERCADO_PAGO_ACCESS_TOKEN: string;
  MERCADO_PAGO_WEBHOOK_SECRET: string;
  APP_URL: string;
};

function getRequiredEnv(name: keyof ServerEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRequiredRawEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let cachedServerEnv: ServerEnv | null = null;
let cachedPaymentsEnv: PaymentsEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  cachedServerEnv = {
    NEXT_PUBLIC_SUPABASE_URL: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };

  return cachedServerEnv;
}

export function getPaymentsEnv(): PaymentsEnv {
  if (cachedPaymentsEnv) {
    return cachedPaymentsEnv;
  }

  cachedPaymentsEnv = {
    MERCADO_PAGO_ACCESS_TOKEN: getRequiredRawEnv("MERCADO_PAGO_ACCESS_TOKEN"),
    MERCADO_PAGO_WEBHOOK_SECRET: getRequiredRawEnv("MERCADO_PAGO_WEBHOOK_SECRET"),
    APP_URL: getRequiredRawEnv("APP_URL"),
  };

  return cachedPaymentsEnv;
}
