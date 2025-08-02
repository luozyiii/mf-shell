export declare class AuthUtils {
    private static readonly TOKEN_KEY;
    private static readonly USER_KEY;
    private static readonly PERMISSIONS_KEY;
    /**
     * 获取token
     */
    static getToken(): string | null;
    /**
     * 设置token
     */
    static setToken(token: string): void;
    /**
     * 移除token
     */
    static removeToken(): void;
    /**
     * 检查是否已登录
     */
    static isAuthenticated(): boolean;
    /**
     * 获取用户数据
     */
    static getUserData(): any;
    /**
     * 设置用户数据
     */
    static setUserData(userData: any): void;
    /**
     * 获取权限数据
     */
    static getPermissions(): any;
    /**
     * 设置权限数据
     */
    static setPermissions(permissions: any): void;
    /**
     * 跳转到登录页面
     * @param returnUrl 登录成功后的回调地址
     */
    static redirectToLogin(returnUrl?: string): void;
    /**
     * 退出登录
     */
    static logout(): void;
    /**
     * 检查token是否过期（简单实现）
     */
    static isTokenExpired(): boolean;
}
