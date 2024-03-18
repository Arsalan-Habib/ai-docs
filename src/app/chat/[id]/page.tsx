import MessagesSection from "@/components/MessagesSection/MessagesSection";
import PdfViewer from "@/components/PDFViewer/PDFViewer";
import dbConnect from "@/lib/mongodb";
import DocGroup from "@/schemas/DocGroup";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const Bucket = process.env.AWS_BUCKET_NAME as string;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const Chat = async ({ params }: { params: { id: string } }) => {
  await dbConnect();
  const docGroup = await DocGroup.findOne({ groupId: params.id });

  let fileUrls: string[] = [];

  if (docGroup) {
    for (const file of docGroup.filenames) {
      const command = new GetObjectCommand({ Bucket, Key: file });
      const src = await getSignedUrl(s3, command, { expiresIn: 3600 });
      fileUrls.push(src);
    }
  }

  console.log("fileUrl", fileUrls);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "2rem 2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <MessagesSection params={params} />
      <PdfViewer url={fileUrls[0]} />
    </div>
  );
};

export default Chat;
