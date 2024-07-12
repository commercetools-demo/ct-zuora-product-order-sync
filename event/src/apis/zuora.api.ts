import fetch from 'node-fetch';
import { logger } from '../utils/logger.utils';
import {
  ZuoraCrudResponse,
  ZuoraObjectQueryProduct,
  ZuoraObjectQueryProductRateChargePlan,
  ZuoraObjectQueryProductRatePlan,
  ZuoraProductRatePlanChargePayload,
  ZuoraProductRatePlanPayload,
  ZuoraProductUpdatePayload,
} from '../types/zuora.types';

class ZuoraSandboxClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  constructor() {
    this.baseUrl = process.env.ZUORA_BASEURL || '';
    this.clientId = process.env.ZUORA_CLIENT_ID || '';
    this.clientSecret = process.env.ZUORA_CLIENT_SECRET || '';
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Set token expiration time (subtract 60 seconds as a buffer)
      const expiresIn = data.expires_in || 3600; // Default to 1 hour if not provided
      this.tokenExpirationTime = Date.now() + (expiresIn - 60) * 1000;
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }
  private async ensureValidToken(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpirationTime ||
      Date.now() >= this.tokenExpirationTime
    ) {
      await this.authenticate();
    }
  }

  private async makeAuthenticatedRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();
      if (result.Errors) {
        throw new Error(result.Errors[0].Message);
      }
      return result;
    } catch (error) {
      logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async createProduct(
    productData: Omit<ZuoraProductUpdatePayload, 'Id'>
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product',
      productData
    );
  }

  async createPlan(
    planData: ZuoraProductRatePlanPayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product-rate-plan',
      planData
    );
  }

  async getPlanByProductId(
    productId: string
  ): Promise<ZuoraObjectQueryProductRatePlan> {
    return this.makeAuthenticatedRequest(
      'GET',
      `/object-query/product-rate-plans?filter[]=ProductId.EQ:${productId}`
    ).then((data) => data.data?.[0]);
  }

  async createPrice(
    priceData: ZuoraProductRatePlanChargePayload
  ): Promise<ZuoraCrudResponse> {
    console.log(priceData);
    
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product-rate-plan-charge',
      priceData
    );
  }

  async updatePrice(
    id: string,
    priceData: ZuoraProductRatePlanChargePayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'PUT',
      `/v1/object/product-rate-plan-charge${id}`,
      priceData
    );
  }

  async getPriceByPlanId(
    planId: string
  ): Promise<ZuoraObjectQueryProductRateChargePlan> {
    return this.makeAuthenticatedRequest(
      'GET',
      `/object-query/product-rate-plans-charges?filter[]=ProductRatePlanId.EQ:${planId}`
    ).then((data) => data.data?.[0]);
  }

  async updateProductByID(
    id: string,
    updateData: ZuoraProductUpdatePayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'PUT',
      `/v1/object/product/${id}`,
      updateData
    );
  }

  async getProductBySKU(sku: string): Promise<ZuoraObjectQueryProduct> {
    return await this.makeAuthenticatedRequest(
      'GET',
      `/object-query/products?filter[]=SKU.EQ:${sku}`
    ).then((data) => data.data?.[0]);
  }

  async createOrder(orderData: any): Promise<any> {
    return this.makeAuthenticatedRequest('POST', '/v1/orders', orderData);
  }
}

export default ZuoraSandboxClient;
