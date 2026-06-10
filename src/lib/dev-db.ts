/**
 * Dev-only in-memory database.
 * Used when Supabase env vars are not configured.
 * Resets every time the dev server restarts.
 * Replace with Supabase for production.
 */

type Row = Record<string, any>;

class DevTable {
  private rows: Row[] = [];
  private nextId = 1;

  insert(data: Row): Row {
    const row = {
      id: data.id || `dev-${this.nextId++}-${Date.now()}`,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    this.rows.push(row);
    return row;
  }

  findOne(where: Partial<Row>): Row | null {
    return this.rows.find((r) =>
      Object.entries(where).every(([k, v]) => r[k] === v)
    ) || null;
  }

  findAll(where: Partial<Row> = {}): Row[] {
    return this.rows.filter((r) =>
      Object.entries(where).every(([k, v]) => r[k] === v)
    );
  }

  update(id: string, data: Row): Row | null {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    this.rows[idx] = { ...this.rows[idx], ...data, updated_at: new Date().toISOString() };
    return this.rows[idx];
  }

  delete(id: string): boolean {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) return false;
    this.rows.splice(idx, 1);
    return true;
  }

  count(): number {
    return this.rows.length;
  }
}

// Singleton tables — survive HMR
declare global {
  // eslint-disable-next-line no-var
  var __devDB: { users: DevTable; products: DevTable; orders: DevTable; order_items: DevTable } | undefined;
}

export const devDB = globalThis.__devDB || {
  users: new DevTable(),
  products: new DevTable(),
  orders: new DevTable(),
  order_items: new DevTable(),
};

if (process.env.NODE_ENV !== 'production') {
  globalThis.__devDB = devDB;
}

export function isUsingDevDB(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return true;
  try {
    new URL(url);
    return !url.includes('supabase.co');
  } catch {
    return true;
  }
}
