import axios from 'axios';
import { logger } from '../utils/logger.utils';
import {
  Order,
  ZuoraAccountSignupPayload,
  ZuoraCrudResponse,
  ZuoraObjectQueryProduct,
  ZuoraObjectQueryProductRateChargePlan,
  ZuoraObjectQueryProductRatePlan,
  ZuoraOrderCreatePayload,
  ZuoraProductRatePlanChargePayload,
  ZuoraProductRatePlanPayload,
  ZuoraProductUpdatePayload,
  ZuoraSignupResponse,
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
      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = await response.data;
      this.accessToken = data.access_token;
      // Set token expiration time (subtract 60 seconds as a buffer)
      const expiresIn = data.expires_in || 3600; // Default to 1 hour if not provided
      this.tokenExpirationTime = Date.now() + (expiresIn - 60) * 1000;
    } catch (error) {
      logger.error('Authentication failed:');
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
      logger.info(`Making ${method} request to ${endpoint}`);
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      const result = await response.data;
      if (result.Errors) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      logger.error(`Request failed: ${method} ${endpoint}`);
      throw new Error((error as any).response.data);
    }
  }

  ////// PRODUCTS //////

  async createProduct(
    productData: Omit<ZuoraProductUpdatePayload, 'Id'>
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product',
      productData
    );
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

  ////// PLANS //////

  async createPlan(
    planData: ZuoraProductRatePlanPayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product-rate-plan',
      planData
    );
  }

  async getPlanBySKU(sku: string): Promise<ZuoraObjectQueryProductRatePlan> {
    return this.getProductBySKU(sku).then((product) => {
      if (!product) {
        throw new Error('Product not found');
      }
      return this.getPlanByProductId(product.id).then((plan) => {
        if (!plan) {
          throw new Error('Product not found');
        }
        return plan;
      });
    });
  }

  async getPlanByProductId(
    productId: string
  ): Promise<ZuoraObjectQueryProductRatePlan> {
    return this.makeAuthenticatedRequest(
      'GET',
      `/object-query/product-rate-plans?filter[]=ProductId.EQ:${productId}`
    ).then((data) => data.data?.[0]);
  }

  /////// PRICES //////

  async createPrice(
    priceData: ZuoraProductRatePlanChargePayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'POST',
      '/v1/object/product-rate-plan-charge',
      priceData
    );
  }

  async deletePrice(id: string): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'DELETE',
      `/v1/object/product-rate-plan-charge/${id}`
    );
  }

  async updatePrice(
    id: string,
    priceData: ZuoraProductRatePlanChargePayload
  ): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'PUT',
      `/v1/object/product-rate-plan-charge/${id}`,
      priceData
    );
  }

  async getPriceByPlanId(
    planId: string
  ): Promise<ZuoraObjectQueryProductRateChargePlan> {
    return this.makeAuthenticatedRequest(
      'GET',
      `/object-query/product-rate-plan-charges?filter[]=productRatePlanId.EQ:${planId}`
    ).then((data) => data.data?.[0]);
  }

  /////// ACCOUNTS //////

  async createAccount(
    accountData: ZuoraAccountSignupPayload
  ): Promise<ZuoraSignupResponse> {
    return this.makeAuthenticatedRequest('POST', '/v1/sign-up', accountData);
  }

  async getAccountByCustomerId(customerId: string): Promise<ZuoraCrudResponse> {
    return this.makeAuthenticatedRequest(
      'get',
      `/v1/action/accounts/${customerId}`
    );
  }

  /////// ORDERS //////

  async createOrder(orderData: ZuoraOrderCreatePayload): Promise<Order> {
    const result = await this.makeAuthenticatedRequest(
      'POST',
      '/v1/orders',
      orderData
    );
    if (!result.success) {
      throw new Error(result.reasons?.[0]?.message || 'Failed to create order');
    }
    return result;
  }
}

export default ZuoraSandboxClient;
