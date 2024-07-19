import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState } from "draft-js";
import htmlToDraft from "html-to-draftjs";

const TextItem = ({ item }) => {
    const blocksFromHtml = htmlToDraft(item.text);

    const { contentBlocks, entityMap } = blocksFromHtml;

    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    
    const editorState = EditorState.createWithContent(contentState);

    return (
        <Editor toolbarHidden editorState={editorState} readOnly={true} />
    );
}

export default TextItem;