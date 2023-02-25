function useFolderLayout() {
  // Filtered file list helper
  const getFiles = () => folderChildren.filter(c => !c.folder && c.name !== '.password');

  // File selection
  const genTotalSelected = (selected: { [key: string]: boolean; }) => {
    const selectInfo = getFiles().map(c => Boolean(selected[c.id]));
    const [hasT, hasF] = [selectInfo.some(i => i), selectInfo.some(i => !i)];
    return hasT && hasF ? 1 : !hasF ? 2 : 0;
  };

  const toggleItemSelected = (id: string) => {
    let val: SetStateAction<{ [key: string]: boolean; }>;
    if (selected[id]) {
      val = { ...selected };
      delete val[id];
    } else {
      val = { ...selected, [id]: true };
    }
    setSelected(val);
    setTotalSelected(genTotalSelected(val));
  };

  const toggleTotalSelected = () => {
    if (genTotalSelected(selected) == 2) {
      setSelected({});
      setTotalSelected(0);
    } else {
      setSelected(Object.fromEntries(getFiles().map(c => [c.id, true])));
      setTotalSelected(2);
    }
  };

  // Selected file download
  const handleSelectedDownload = () => {
    const folderName = path.substring(path.lastIndexOf('/') + 1);
    const folder = folderName ? decodeURIComponent(folderName) : undefined;
    const files = getFiles()
      .filter(c => selected[c.id])
      .map(c => ({
        name: c.name,
        url: `/api/raw/?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`,
      }));

    if (files.length == 1) {
      const el = document.createElement('a');
      el.style.display = 'none';
      document.body.appendChild(el);
      el.href = files[0].url;
      el.click();
      el.remove();
    } else if (files.length > 1) {
      setTotalGenerating(true);

      const toastId = toast.loading(<DownloadingToast router={router} />);
      downloadMultipleFiles({ toastId, router, files, folder })
        .then(() => {
          setTotalGenerating(false);
          toast.success(t('Finished downloading selected files.'), {
            id: toastId,
          });
        })
        .catch(() => {
          setTotalGenerating(false);
          toast.error(t('Failed to download selected files.'), { id: toastId });
        });
    }
  };

  // Get selected file permalink
  const handleSelectedPermalink = (baseUrl: string) => {
    return getFiles()
      .filter(c => selected[c.id])
      .map(
        c => `${baseUrl}/api/raw/?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`
      )
      .join('\n');
  };

  // Folder recursive download
  const handleFolderDownload = (path: string, id: string, name?: string) => () => {
    const files = (async function* () {
      for await (const { meta: c, path: p, isFolder, error } of traverseFolder(path)) {
        if (error) {
          toast.error(
            t('Failed to download folder {{path}}: {{status}} {{message}} Skipped it to continue.', {
              path: p,
              status: error.status,
              message: error.message,
            })
          );
          continue;
        }
        const hashedTokenForPath = getStoredToken(p);
        yield {
          name: c?.name,
          url: `/api/raw/?path=${p}${hashedTokenForPath ? `&odpt=${hashedTokenForPath}` : ''}`,
          path: p,
          isFolder,
        };
      }
    })();

    setFolderGenerating({ ...folderGenerating, [id]: true });
    const toastId = toast.loading(<DownloadingToast router={router} />);

    downloadTreelikeMultipleFiles({
      toastId,
      router,
      files,
      basePath: path,
      folder: name,
    })
      .then(() => {
        setFolderGenerating({ ...folderGenerating, [id]: false });
        toast.success(t('Finished downloading folder.'), { id: toastId });
      })
      .catch(() => {
        setFolderGenerating({ ...folderGenerating, [id]: false });
        toast.error(t('Failed to download folder.'), { id: toastId });
      });
  };

  // Folder layout component props
  const folderProps = {
    toast,
    path,
    folderChildren,
    selected,
    toggleItemSelected,
    totalSelected,
    toggleTotalSelected,
    totalGenerating,
    handleSelectedDownload,
    folderGenerating,
    handleSelectedPermalink,
    handleFolderDownload,
  };
  return folderProps;

  //       {layout.name === 'Grid' ? <FolderGridLayout {...folderProps} /> : <FolderListLayout {...folderProps} />}
}
