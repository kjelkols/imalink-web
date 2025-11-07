'use client';

import { useState, useEffect } from 'react';
import { PhotoTextDocumentCreate, PhotoTextDocumentUpdate, PhotoWithTags } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ImagePicker } from '@/components/phototext/ImagePicker';
import { 
  Plus, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  Image as ImageIcon, 
  List, 
  ListOrdered,
  Trash2,
  ImagePlus
} from 'lucide-react';

interface PhotoTextBlock {
  type: 'heading' | 'paragraph' | 'image' | 'images' | 'list';
  level?: number;
  content?: Array<{ type: 'text' | 'bold' | 'italic'; text: string }>;
  images?: Array<{ imageId: string; caption?: string; alt?: string }>;
  imageId?: string;
  caption?: string;
  alt?: string;
  items?: string[];
  ordered?: boolean;
}

interface StoryEditorProps {
  initialData?: {
    title: string;
    abstract?: string;
    content?: { blocks: PhotoTextBlock[] };
    cover_image_hash?: string;
    cover_image_alt?: string;
  };
  onSave: (data: PhotoTextDocumentCreate | PhotoTextDocumentUpdate) => Promise<void>;
  onCancel: () => void;
}

export function StoryEditor({ initialData, onSave, onCancel }: StoryEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [coverImageHash, setCoverImageHash] = useState(initialData?.cover_image_hash || '');
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.cover_image_alt || '');
  const [blocks, setBlocks] = useState<PhotoTextBlock[]>(
    initialData?.content?.blocks || [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  );
  const [saving, setSaving] = useState(false);
  const [showCoverImagePicker, setShowCoverImagePicker] = useState(false);
  const [coldPreviewUrls, setColdPreviewUrls] = useState<Map<string, string>>(new Map());

  // Load coldpreview for a specific hothash
  const loadColdPreview = async (hothash: string) => {
    if (!hothash || coldPreviewUrls.has(hothash)) return;
    
    try {
      const url = await apiClient.fetchColdPreview(hothash);
      setColdPreviewUrls(prev => new Map(prev).set(hothash, url));
    } catch (error) {
      console.error('Failed to load coldpreview for', hothash, error);
    }
  };

  // Load coldpreview for cover image and all image blocks
  useEffect(() => {
    if (coverImageHash) {
      loadColdPreview(coverImageHash);
    }

    blocks.forEach(block => {
      if (block.type === 'image' && block.imageId) {
        loadColdPreview(block.imageId);
      }
    });
  }, [coverImageHash, blocks]);

  const handleCoverImageSelect = (hothash: string, photo: PhotoWithTags) => {
    setCoverImageHash(hothash);
    setShowCoverImagePicker(false);
  };

  const addBlock = (type: PhotoTextBlock['type']) => {
    let newBlock: PhotoTextBlock;
    
    switch (type) {
      case 'heading':
        newBlock = { type: 'heading', level: 2, content: [{ type: 'text', text: '' }] };
        break;
      case 'paragraph':
        newBlock = { type: 'paragraph', content: [{ type: 'text', text: '' }] };
        break;
      case 'image':
        newBlock = { type: 'image', imageId: '', caption: '', alt: '' };
        break;
      case 'list':
        newBlock = { type: 'list', items: [''], ordered: false };
        break;
      default:
        newBlock = { type: 'paragraph', content: [{ type: 'text', text: '' }] };
    }
    
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<PhotoTextBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    } else if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Tittelen kan ikke være tom');
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        document_type: 'general' as const,
        content: {
          version: '1.0',
          documentType: 'general',
          title: title.trim(),
          abstract: abstract.trim() || undefined,
          blocks: blocks,
        },
        abstract: abstract.trim() || undefined,
        cover_image: coverImageHash ? {
          hash: coverImageHash,
          alt: coverImageAlt || title,
        } : undefined,
        is_published: false, // Always save as not published for now
      };

      console.log('Sending PhotoText data:', JSON.stringify(data, null, 2));
      await onSave(data);
    } catch (error) {
      console.error('Failed to save story:', error);
      alert('Kunne ikke lagre historien');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Meta Fields */}
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="title">Tittel *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Skriv en fengende tittel..."
            className="text-2xl font-bold"
          />
        </div>

        <div>
          <Label htmlFor="abstract">Sammendrag</Label>
          <Textarea
            id="abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Et kort sammendrag av historien..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="coverImage">Omslagsbilde</Label>
          {!coverImageHash ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowCoverImagePicker(!showCoverImagePicker)}
              >
                <ImagePlus className="h-4 w-4" />
                {showCoverImagePicker ? 'Skjul bildevelger' : 'Velg omslagsbilde'}
              </Button>
              
              {showCoverImagePicker && (
                <div className="mt-4 border rounded-lg p-4">
                  <ImagePicker
                    onImageSelect={handleCoverImageSelect}
                    selectedHash={coverImageHash}
                    onClose={() => setShowCoverImagePicker(false)}
                  />
                </div>
              )}
              
              <div>
                <Label className="text-xs text-muted-foreground">
                  Eller skriv inn hothash manuelt:
                </Label>
                <Input
                  id="coverImage"
                  value={coverImageHash}
                  onChange={(e) => setCoverImageHash(e.target.value)}
                  placeholder="SHA256 hash..."
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                {coldPreviewUrls.get(coverImageHash) ? (
                  <img
                    src={coldPreviewUrls.get(coverImageHash)}
                    alt={coverImageAlt || title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-sm text-muted-foreground">Laster bilde...</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setCoverImageHash('');
                    setCoverImageAlt('');
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                id="coverAlt"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Bildetekst for omslag..."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Content Blocks */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <BlockEditor
            key={index}
            block={block}
            index={index}
            onUpdate={(updates) => updateBlock(index, updates)}
            onRemove={() => removeBlock(index)}
            onMoveUp={() => moveBlock(index, 'up')}
            onMoveDown={() => moveBlock(index, 'down')}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
            coldPreviewUrls={coldPreviewUrls}
          />
        ))}
      </div>

      {/* Add Block Toolbar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Legg til:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addBlock('paragraph')}
            className="gap-2"
          >
            <Type className="h-4 w-4" />
            Avsnitt
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addBlock('heading')}
            className="gap-2"
          >
            <Heading2 className="h-4 w-4" />
            Overskrift
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addBlock('image')}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Bilde
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addBlock('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Liste
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 border rounded-lg shadow-lg">
        <Button onClick={onCancel} variant="outline">
          Avbryt
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Lagrer...' : 'Lagre'}
        </Button>
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block: PhotoTextBlock;
  index: number;
  onUpdate: (updates: Partial<PhotoTextBlock>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  coldPreviewUrls: Map<string, string>;
}

function BlockEditor({ block, index, onUpdate, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, coldPreviewUrls }: BlockEditorProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  const getText = () => block.content?.map(c => c.text).join('') || '';
  const setText = (text: string) => onUpdate({ content: [{ type: 'text', text }] });

  const handleImageSelect = (hothash: string, photo: PhotoWithTags) => {
    onUpdate({ 
      imageId: hothash,
      alt: '', // User can edit after selection
    });
    setShowImagePicker(false);
  };

  return (
    <Card className="p-4 relative">
      <div className="flex items-start gap-3">
        {/* Block Controls - Inside the card */}
        <div className="flex flex-col gap-1 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-7 w-7 p-0"
            title="Flytt opp"
          >
            ↑
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-7 w-7 p-0"
            title="Flytt ned"
          >
            ↓
          </Button>
        </div>

      <div className="flex items-start gap-3 flex-1">
        
        <div className="flex-1">
          {block.type === 'heading' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={block.level || 2}
                  onChange={(e) => onUpdate({ level: Number(e.target.value) })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                </select>
              </div>
              <Input
                value={getText()}
                onChange={(e) => setText(e.target.value)}
                placeholder="Overskrift..."
                className="text-xl font-bold"
              />
            </div>
          )}

          {block.type === 'paragraph' && (
            <Textarea
              value={getText()}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv avsnitt..."
              rows={4}
            />
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              {!block.imageId ? (
                <div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {showImagePicker ? 'Skjul bildevelger' : 'Velg bilde fra bildeliste'}
                  </Button>
                  
                  {showImagePicker && (
                    <div className="mt-4 border rounded-lg p-4">
                      <ImagePicker
                        onImageSelect={handleImageSelect}
                        selectedHash={block.imageId}
                        onClose={() => setShowImagePicker(false)}
                      />
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <Label className="text-xs text-muted-foreground">
                      Eller skriv inn hothash manuelt:
                    </Label>
                    <Input
                      value={block.imageId || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ imageId: e.target.value })}
                      placeholder="SHA256 hash..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    {coldPreviewUrls.get(block.imageId) ? (
                      <img
                        src={coldPreviewUrls.get(block.imageId)}
                        alt={block.alt || 'Forhåndsvisning'}
                        className="w-full rounded border"
                      />
                    ) : (
                      <div className="w-full aspect-video flex items-center justify-center bg-muted border rounded">
                        <p className="text-sm text-muted-foreground">Laster bilde...</p>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => onUpdate({ imageId: '', alt: '', caption: '' })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Input
                    value={block.caption || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ caption: e.target.value })}
                    placeholder="Bildetekst..."
                  />
                  <Input
                    value={block.alt || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ alt: e.target.value })}
                    placeholder="Alt-tekst..."
                  />
                </div>
              )}
            </div>
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={block.ordered ? 'default' : 'outline'}
                  onClick={() => onUpdate({ ordered: true })}
                >
                  Nummerert
                </Button>
                <Button
                  size="sm"
                  variant={!block.ordered ? 'default' : 'outline'}
                  onClick={() => onUpdate({ ordered: false })}
                >
                  Punktliste
                </Button>
              </div>
              {block.items?.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.items || [])];
                      newItems[i] = e.target.value;
                      onUpdate({ items: newItems });
                    }}
                    placeholder={`${block.ordered ? `${i + 1}.` : '•'} Listepunkt...`}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onUpdate({ items: block.items?.filter((_, idx) => idx !== i) });
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onUpdate({ items: [...(block.items || []), ''] });
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Legg til punkt
              </Button>
            </div>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="flex-shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </Card>
  );
}
