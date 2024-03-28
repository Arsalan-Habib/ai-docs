"use client";
import { Skeleton, Typography } from "@mui/material";
import styles from "./chat.module.css";

const Loading = () => {
  return (
    <div style={{ width: "100%", padding: "2rem", maxWidth: "50%" }}>
      <Skeleton variant="rounded">
        <Typography sx={{ width: "100%" }} variant="h3">
          asjdhasjkdhasjkdhasjkdhjasdhasjkh
        </Typography>
      </Skeleton>
      <div style={{ marginTop: "2rem" }}>
        <div className={styles.humanMsg}>
          <Skeleton>
            <Typography variant="body1">asdasjdhasjdhasjdhajksdh</Typography>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhadhasjkdhajksdhajksdhajksdhajksdhjkashdajksdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhadhasjkdhajksdhajksdhajksdhajksdhjkashdajksdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">dhasjkdhasjkdhasjkdhasjkdhasjkdhashjkdhasjkdasjdhajkasjdh</Typography>
          </Skeleton>
        </div>
        <div className={styles.humanMsg}>
          <Skeleton>
            <Typography variant="body1">asdasjdhasjdhasjdhajksdh</Typography>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">adhasjkdhasjkdhjkashdjkashdjkhasjkdha</Typography>
          </Skeleton>
        </div>
        <div className={styles.humanMsg}>
          <Skeleton>
            <Typography variant="body1">asdasjdhasjdhasjdhajksdh</Typography>
          </Skeleton>
        </div>
        <div className={styles.aiMsg}>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">
              asdasjdhasjdhasjdhajksdhasgdashgdashgdashgdahsgddasdhgasgasgashgdashgdasghasdgashgasdhgd
            </Typography>
          </Skeleton>
          <Skeleton>
            <Typography variant="body1">adhasjkdhasjkdhjkashdjkashdjkhasjkdha</Typography>
          </Skeleton>
        </div>
      </div>
    </div>
  );
};

export default Loading;
