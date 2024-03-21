export interface ChatMessage {
  type: "human" | "ai";
  data: {
    content: string;
    additional_kwargs?: Record<string, any>;
  };
}

export enum AuthErrorTypes {
  Signin = "Signin",
  OAuthSignin = "OAuthSignin",
  OAuthCallback = "OAuthCallback",
  OAuthCreateAccount = "OAuthCreateAccount",
  EmailCreateAccount = "EmailCreateAccount",
  Callback = "Callback",
  OAuthAccountNotLinked = "OAuthAccountNotLinked",
  EmailSignin = "EmailSignin",
  CredentialsSignin = "CredentialsSignin",
  default = "default",
}
