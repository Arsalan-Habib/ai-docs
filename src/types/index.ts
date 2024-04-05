export interface ChatMessage {
  type: "human" | "ai" | "loading";
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

export enum UploadStages {
  CLOUD_UPLOADING = "cloud_uploading",
  MERGING_PDF = "merging_pdf",
  STORE_EMBEDDINGS = "store_embeddings",
  UPLOADING_COMPLETE = "uploading_complete",
  // UPLOADING_TO_SERVER = "uploading_to_server",
}
