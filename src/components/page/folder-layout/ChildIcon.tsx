import { getFileIcon } from '@/utils/getFileIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DriveItem } from '@/utils/api/type';
import { renderEmoji } from '../utils';

export default function ChildIcon({ child }: { child: DriveItem; }) {
  const { render, emoji } = renderEmoji(child.name);
  return render ? (
    <span>{emoji ? emoji[0] : '📁'}</span>
  ) : (
    <FontAwesomeIcon icon={child.file ? getFileIcon(child.name, { video: Boolean(child.video) }) : ['far', 'folder']} />
  );
}
