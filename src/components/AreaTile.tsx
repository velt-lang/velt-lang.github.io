/** An area's colored glyph tile (design/Api.dc.html): the switcher, the catalog, search. */
import { component } from 'sigx';
import { tint, type Area } from '../lib/docs-areas';

export type AreaItem = Pick<Area, 'id' | 'label' | 'meta' | 'glyph' | 'color' | 'href'>;

export const AreaTile = component<{ area: Pick<Area, 'glyph' | 'color'>; size: number }>(({ props }) => () => (
    <span
        aria-hidden="true"
        class="grid flex-none place-items-center rounded-[7px] border font-mono"
        style={{
            width: `${props.size}px`,
            height: `${props.size}px`,
            fontSize: props.size > 28 ? '12px' : '11px',
            color: props.area.color,
            background: tint(props.area.color, 0.12),
            borderColor: tint(props.area.color, 0.35),
        }}
    >
        {props.area.glyph}
    </span>
), { name: 'AreaTile' });

