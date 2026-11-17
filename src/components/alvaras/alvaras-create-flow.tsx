"use client";

import { useEffect, useState } from "react";
import { Plus, UploadCloud } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { NewAlvaraModal } from "./new-alvara-modal";
import type { AlvaraType } from "@/lib/types/database";

/**
 * "Novo alvará" button + a page-wide drop target: dragging any file over
 * the /alvaras screen and dropping it opens the same modal with that file
 * pre-attached, so the person just needs to pick/create the cliente and the
 * tipo before saving. Listens on `window` (not a local div) because
 * dragenter/dragleave fire once per element the pointer crosses, so
 * counting them locally is unreliable -- window-level events plus a depth
 * counter is the standard way to know when the drag truly left the page.
 */
export function AlvarasCreateFlow({ types }: { types: AlvaraType[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  useEffect(() => {
    let depth = 0;

    function isFileDrag(e: DragEvent) {
      return e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files");
    }

    function onDragEnter(e: DragEvent) {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth++;
      setDragging(true);
    }
    function onDragOver(e: DragEvent) {
      if (!isFileDrag(e)) return;
      e.preventDefault();
    }
    function onDragLeave(e: DragEvent) {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    }
    function onDrop(e: DragEvent) {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        setDroppedFile(file);
        setModalKey((k) => k + 1);
        setModalOpen(true);
      }
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          setDroppedFile(null);
          setModalKey((k) => k + 1);
          setModalOpen(true);
        }}
      >
        <Plus size={14} /> Novo alvará
      </Button>

      {dragging && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[rgba(10,16,24,.42)] p-8 backdrop-blur-[2px]">
          <div className="dropzone is-dragging w-full max-w-md !cursor-copy !py-12 shadow-xl">
            <span className="dropzone-icon !text-[#d95a08]">
              <UploadCloud size={20} strokeWidth={1.7} />
            </span>
            <p className="dropzone-title mt-1">Solte o arquivo para criar um novo alvará</p>
            <p className="dropzone-hint">PDF, JPG, PNG ou WEBP</p>
          </div>
        </div>
      )}

      <NewAlvaraModal key={modalKey} types={types} open={modalOpen} onOpenChange={setModalOpen} initialFile={droppedFile} />
    </>
  );
}
