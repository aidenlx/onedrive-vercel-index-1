import { getFileIcon } from '@ui/utils/getFileIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DriveItem } from '@od/util/graph-api/type';
import { renderEmoji } from '@ui/utils/page';
import { faFolder } from '@fortawesome/free-regular-svg-icons';

export default function ChildIcon({ child }: { child: DriveItem; }) {
  const { render, emoji } = renderEmoji(child.name);
  return render ? (
    <span>{emoji ? emoji[0] : '📁'}</span>
  ) : (
    <FontAwesomeIcon icon={child.file ? getFileIcon(child.name, { video: Boolean(child.video) }) : faFolder} />
  );
}
