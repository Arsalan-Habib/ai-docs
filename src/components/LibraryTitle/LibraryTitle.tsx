"use client";

import SearchIcon from "@/icons/SearchIcon";
import { IFolder } from "@/schemas/Folder";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const LibraryTitle = () => {
  const params = useParams();
  const [folder, setFolder] = useState<IFolder | undefined>(undefined);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    async function fetchFolder() {
      if (!params.folderId) {
        setFolder(undefined);
        return;
      }

      const res = await fetch(`/api/folder/${params.folderId}`);
      const data = await res.json();

      if (data.status) {
        setFolder(data.data);
      }
    }

    fetchFolder();
  }, [params.folderId]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1>
        <Link href="/library" style={{ textDecoration: "none", color: "black" }}>
          <span>Library</span>
        </Link>{" "}
        <span>{!!folder ? `> ${folder.name}` : ""}</span>
      </h1>
      <TextField
        variant="standard"
        sx={{
          px: 2,
          py: 1,

          fontSize: "2rem",
          width: "40rem",
          backgroundColor: "rgba(229, 240, 255, 0.1)",
          borderRadius: "1rem",
          border: `1px solid rgba(83, 93, 107, 0.8)`,
        }}
        InputProps={{
          disableUnderline: true,
          endAdornment: <SearchIcon />,
        }}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search"
        inputProps={{
          sx: {
            fontSize: "1.5rem",
          },
        }}
        defaultValue={searchParams.get("query")?.toString() || ""}
      />
      <div></div>
    </div>
  );
};

export default LibraryTitle;
