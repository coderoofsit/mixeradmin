import { Dispatch, SetStateAction } from "react";

type Props = {
	key?: string;
	formData: any;
	editingTagIndex: number | null;
	setEditingTagIndex: Dispatch<SetStateAction<number | null>>;
	editingTagValue: string;
	setEditingTagValue: Dispatch<SetStateAction<string>>;
	startEditingTag: (index: number, tag: string) => void;
	handleEditTagSave: (index: number) => void;
	removeTag: (index: number) => void;
	idx: number;
	tag: string;
};

export default function TagChips(props: Props) {
	const {
		formData,
		editingTagIndex,
		setEditingTagIndex,
		editingTagValue,
		setEditingTagValue,
		startEditingTag,
		handleEditTagSave,
		removeTag,
	} = props;
	const tags = Array.isArray(formData?.tags) ? formData.tags : [];
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700 mb-1'>
				Tags
			</label>
			<div className='w-full border rounded-lg px-2 py-2 border-gray-300'>
				<div className='flex flex-wrap items-center gap-2'>
					{tags.map((tag: any, idx: any) => (
						<span
							key={`${tag}-${idx}`}
							className='flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full'
						>
							{editingTagIndex === idx ? (
								<input
									key={`tag-input-${idx}`}
									type='text'
									value={editingTagValue}
									autoFocus
									onChange={(e) => setEditingTagValue(e.target.value)}
									onBlur={() => handleEditTagSave(idx)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleEditTagSave(idx);
										else if (e.key === "Escape") setEditingTagIndex(null);
									}}
									className='bg-transparent outline-none text-blue-800 text-xs border border-blue-400 rounded px-1'
								/>
							) : (
								<>
									<span
										onClick={() => startEditingTag(idx, tag)}
										className='cursor-text text-blue-900 text-xs'
										role='textbox'
										tabIndex={0}
										onKeyDown={(e) =>
											e.key === "Enter" && startEditingTag(idx, tag)
										}
									>
										{tag}
									</span>
									<button
										type='button'
										onClick={() => removeTag(idx)}
										className='text-blue-700 hover:text-blue-900 text-sm leading-none'
										aria-label={`Remove ${tag}`}
									>
										×
									</button>
								</>
							)}
						</span>
					))}
				</div>
			</div>
		</div>
	);
}
