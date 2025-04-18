// global.d.ts
export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement | null,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'small' | 'medium' | 'large';
            }
          ) => void;
        };
      };
    };
  }
}
