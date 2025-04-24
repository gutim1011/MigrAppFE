export interface MfaResponse {
  token: string;
  email: string;
  userType: string;
  deviceIsTrusted: boolean;
}
