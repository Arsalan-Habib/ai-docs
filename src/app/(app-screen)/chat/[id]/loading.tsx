"use client";
import Skeleton from "@mui/material/Skeleton";
import styles from "./chat.module.css";

const Loading = () => {
  return (
    <div style={{ width: "100%", padding: "2rem", maxWidth: "50%" }}>
      <Skeleton variant="rounded">
        <h3 style={{ width: "100%" }}>asjdhasjkdhasjkdhasjkdhjasdhasjkh</h3>
      </Skeleton>
      <div style={{ marginTop: "2rem" }}>
        <div className={styles.humanMsg}>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdh</p>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <p>
              asdasjdhasjdhasjdhajksdhadhasjkdhajksdhajksdhajksdhajksdhjkashdajksdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh
            </p>
          </Skeleton>
          <Skeleton>
            <p>
              asdasjdhasjdhasjdhajksdhadhasjkdhajksdhajksdhajksdhajksdhjkashdajksdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh
            </p>
          </Skeleton>
          <Skeleton>
            <p>dhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh</p>
          </Skeleton>
        </div>
        <div className={styles.humanMsg}>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdh</p>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd</p>
          </Skeleton>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd</p>
          </Skeleton>
          <Skeleton>
            <p>adhasjkdhasjkdhjkashdjkashdjkhasjkdha</p>
          </Skeleton>
        </div>
        <div className={styles.humanMsg}>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdh</p>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd</p>
          </Skeleton>
          <Skeleton>
            <p>asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd</p>
          </Skeleton>
          <Skeleton>
            <p>adhasjkdhasjkdhjkashdjkashdjkhasjkdha</p>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default Loading;
