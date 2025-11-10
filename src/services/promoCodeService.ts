import { supabase } from '../lib/supabase';

export interface PromoCode {
  id: string;
  organizer_id: string;
  event_id?: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_limit?: number;
  max_uses_per_user: number;
  minimum_purchase_amount: number;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'paused' | 'expired' | 'deleted';
  is_active: boolean;
  usage_count: number;
  total_discount_given: number;
  total_revenue_generated: number;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  registration_id?: string;
  event_id: string;
  user_email: string;
  user_name?: string;
  original_price: number;
  discount_amount: number;
  final_price: number;
  applied_at: string;
}

export interface PromoCodeAnalytics {
  total_codes: number;
  active_codes: number;
  total_uses: number;
  total_discount_given: number;
  total_revenue_generated: number;
  avg_discount_per_use: number;
  conversion_rate: number;
}

export interface CreatePromoCodeData {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_limit?: number;
  max_uses_per_user?: number;
  minimum_purchase_amount?: number;
  start_date?: string;
  expiry_date: string;
  event_id?: string;
}

export class PromoCodeService {
  // Get all promo codes for an organizer
  static async getPromoCodesByOrganizer(
    organizerId: string
  ): Promise<{
    success: boolean;
    promoCodes?: PromoCode[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('organizer_id', organizerId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        promoCodes: data || [],
      };
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Create a new promo code
  static async createPromoCode(
    organizerId: string,
    data: CreatePromoCodeData
  ): Promise<{
    success: boolean;
    promoCode?: PromoCode;
    error?: string;
  }> {
    try {
      // Convert code to uppercase
      const codeUpper = data.code.toUpperCase();

      // Check if code already exists
      const { data: existing } = await supabase
        .from('promo_codes')
        .select('id')
        .eq('code', codeUpper)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'Promo code already exists',
        };
      }

      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .insert({
          organizer_id: organizerId,
          code: codeUpper,
          description: data.description,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          usage_limit: data.usage_limit,
          max_uses_per_user: data.max_uses_per_user || 1,
          minimum_purchase_amount: data.minimum_purchase_amount || 0,
          start_date: data.start_date || new Date().toISOString(),
          expiry_date: data.expiry_date,
          event_id: data.event_id,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        promoCode: promoCode,
      };
    } catch (error) {
      console.error('Error creating promo code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Update a promo code
  static async updatePromoCode(
    promoCodeId: string,
    updates: Partial<CreatePromoCodeData>
  ): Promise<{
    success: boolean;
    promoCode?: PromoCode;
    error?: string;
  }> {
    try {
      const updateData: any = { ...updates };

      // Convert code to uppercase if provided
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }

      const { data, error } = await supabase
        .from('promo_codes')
        .update(updateData)
        .eq('id', promoCodeId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        promoCode: data,
      };
    } catch (error) {
      console.error('Error updating promo code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Toggle promo code status
  static async togglePromoCodeStatus(
    promoCodeId: string,
    status: 'active' | 'paused'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ status })
        .eq('id', promoCodeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error toggling promo code status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Delete a promo code (soft delete)
  static async deletePromoCode(promoCodeId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ status: 'deleted', is_active: false })
        .eq('id', promoCodeId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting promo code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get promo code usage history
  static async getPromoCodeUsage(
    promoCodeId: string
  ): Promise<{
    success: boolean;
    usage?: PromoCodeUsage[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('promo_code_usage')
        .select('*')
        .eq('promo_code_id', promoCodeId)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        usage: data || [],
      };
    } catch (error) {
      console.error('Error fetching promo code usage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get promo code analytics
  static async getPromoCodeAnalytics(
    organizerId: string
  ): Promise<{
    success: boolean;
    analytics?: PromoCodeAnalytics;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_promo_code_analytics', {
        p_organizer_id: organizerId,
      });

      if (error) throw error;

      const analytics = data && data.length > 0 ? data[0] : null;

      return {
        success: true,
        analytics: analytics || {
          total_codes: 0,
          active_codes: 0,
          total_uses: 0,
          total_discount_given: 0,
          total_revenue_generated: 0,
          avg_discount_per_use: 0,
          conversion_rate: 0,
        },
      };
    } catch (error) {
      console.error('Error fetching promo code analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get detailed analytics for a specific promo code
  static async getPromoCodeDetailedAnalytics(
    promoCodeId: string
  ): Promise<{
    success: boolean;
    analytics?: {
      total_uses: number;
      unique_users: number;
      total_discount_given: number;
      total_revenue: number;
      avg_discount: number;
      usage_by_day: { date: string; count: number }[];
      top_users: { email: string; uses: number; revenue: number }[];
    };
    error?: string;
  }> {
    try {
      // Get usage data
      const { data: usage, error: usageError } = await supabase
        .from('promo_code_usage')
        .select('*')
        .eq('promo_code_id', promoCodeId);

      if (usageError) throw usageError;

      if (!usage || usage.length === 0) {
        return {
          success: true,
          analytics: {
            total_uses: 0,
            unique_users: 0,
            total_discount_given: 0,
            total_revenue: 0,
            avg_discount: 0,
            usage_by_day: [],
            top_users: [],
          },
        };
      }

      // Calculate metrics
      const uniqueUsers = new Set(usage.map((u: any) => u.user_email)).size;
      const totalDiscountGiven = usage.reduce(
        (sum: number, u: any) => sum + (u.discount_amount || 0),
        0
      );
      const totalRevenue = usage.reduce(
        (sum: number, u: any) => sum + (u.final_price || 0),
        0
      );

      // Usage by day
      const usageByDay = usage.reduce((acc: any, u: any) => {
        const date = new Date(u.applied_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const usageByDayArray = Object.entries(usageByDay)
        .map(([date, count]) => ({ date, count: count as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top users
      const userStats = usage.reduce((acc: any, u: any) => {
        if (!acc[u.user_email]) {
          acc[u.user_email] = { email: u.user_email, uses: 0, revenue: 0 };
        }
        acc[u.user_email].uses += 1;
        acc[u.user_email].revenue += u.final_price || 0;
        return acc;
      }, {});

      const topUsers = Object.values(userStats)
        .sort((a: any, b: any) => b.uses - a.uses)
        .slice(0, 10);

      return {
        success: true,
        analytics: {
          total_uses: usage.length,
          unique_users: uniqueUsers,
          total_discount_given: totalDiscountGiven,
          total_revenue: totalRevenue,
          avg_discount: totalDiscountGiven / usage.length,
          usage_by_day: usageByDayArray,
          top_users: topUsers as any,
        },
      };
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Validate a promo code (client-side check before applying)
  static async validatePromoCode(
    code: string,
    eventId: string,
    userEmail: string,
    originalPrice: number
  ): Promise<{
    valid: boolean;
    discount_amount?: number;
    final_price?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: code.toUpperCase(),
        p_event_id: eventId,
        p_user_email: userEmail,
        p_original_price: originalPrice,
      });

      if (error) throw error;

      return data as any;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate a random promo code
  static generateRandomCode(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Export promo codes to CSV
  static exportPromoCodesCSV(promoCodes: PromoCode[], filename: string = 'promo_codes'): void {
    if (!promoCodes || promoCodes.length === 0) return;

    const headers = [
      'Code',
      'Description',
      'Discount Type',
      'Discount Value',
      'Usage Count',
      'Usage Limit',
      'Total Discount Given',
      'Total Revenue',
      'Expiry Date',
      'Status',
    ];

    const rows = promoCodes.map((code) => [
      code.code,
      code.description || '',
      code.discount_type,
      code.discount_value,
      code.usage_count,
      code.usage_limit || 'Unlimited',
      code.total_discount_given.toFixed(2),
      code.total_revenue_generated.toFixed(2),
      new Date(code.expiry_date).toLocaleDateString(),
      code.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
          )
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
