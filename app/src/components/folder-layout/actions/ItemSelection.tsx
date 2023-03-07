'use client';
import { DriveItem } from '@od/util/graph-api/type';
import { useStore } from '../../store';
import Checkbox from '../Checkbox';

function ItemSelection({ c, label, className }: { c: DriveItem; label: { selectFile: string; }; className?: string; }) {
  const selected = useStore(s => s.selected.get(c.id)), toggleItemSelected = useStore(s => s.toggleSelected);

  return (
    <div className={className}>
      {!c.folder && !(c.name === '.password') && (
        <Checkbox checked={selected ? 2 : 0} onChange={() => toggleItemSelected(c.id)} title={label.selectFile} />
      )}
    </div>
  );
}

export interface ItemSelectionLabels {
  selectFile: string;
}

export function ItemSelectionList(props: { c: DriveItem; label: ItemSelectionLabels; }) {
  return <ItemSelection {...props} className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex" />;
}
export function ItemSelectionGrid(props: { c: DriveItem; label: { selectFile: string; }; }) {
  const selected = useStore(s => s.selected.get(props.c.id));

  return (
    <ItemSelection
      {...props}
      className={`${selected ? 'opacity-100' : 'opacity-0'} absolute top-0 left-0 z-10 m-1 rounded bg-white/50 py-0.5 group-hover:opacity-100 dark:bg-gray-900/50`} />
  );
}
