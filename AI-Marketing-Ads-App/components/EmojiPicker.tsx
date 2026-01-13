import { useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';
import { useBrandStore } from '../src/stores/brandStore';
import { getBrandEmojiSuggestions } from '../src/services/brandEmojiService';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

// Default fallback suggestions
const DEFAULT_EMOJI_SUGGESTIONS = ['✨', '🔥', '💪', '🚀', '💯', '⚡'];

// Emoji names for search and hover
const EMOJI_NAMES: Record<string, string> = {
  '😀': 'grinning face', '😃': 'grinning face with big eyes', '😄': 'grinning face with smiling eyes',
  '😁': 'beaming face', '😆': 'grinning squinting face', '😅': 'grinning face with sweat',
  '🤣': 'rolling on the floor laughing', '😂': 'face with tears of joy', '🙂': 'slightly smiling face',
  '🙃': 'upside-down face', '😉': 'winking face', '😊': 'smiling face with smiling eyes',
  '😇': 'smiling face with halo', '🥰': 'smiling face with hearts love', '😍': 'smiling face with heart-eyes love',
  '🤩': 'star-struck', '😘': 'face blowing a kiss love', '😗': 'kissing face',
  '😚': 'kissing face with closed eyes', '😙': 'kissing face with smiling eyes', '😋': 'face savoring food',
  '😛': 'face with tongue', '😜': 'winking face with tongue', '🤪': 'zany face',
  '😝': 'squinting face with tongue', '🤑': 'money-mouth face', '🤗': 'hugging face',
  '🤭': 'face with hand over mouth', '🤫': 'shushing face', '🤔': 'thinking face',
  '😎': 'smiling face with sunglasses', '🤓': 'nerd face', '🧐': 'face with monocle',
  '🥳': 'partying face', '😏': 'smirking face', '😒': 'unamused face',
  '🙄': 'face with rolling eyes', '😬': 'grimacing face', '😌': 'relieved face',
  '😔': 'pensive face', '😪': 'sleepy face', '😴': 'sleeping face',
  '✨': 'sparkles', '🔥': 'fire', '💪': 'flexed biceps', '🚀': 'rocket',
  '💯': 'hundred points', '⚡': 'high voltage', '❤️': 'red heart love', '💙': 'blue heart love',
  '💚': 'green heart love', '💛': 'yellow heart love', '💜': 'purple heart love', '🧡': 'orange heart love',
  '🖤': 'black heart love', '🤍': 'white heart love', '🤎': 'brown heart love', '💔': 'broken heart love sad',
  '❣️': 'heart exclamation love', '💕': 'two hearts love', '💞': 'revolving hearts love', '💓': 'beating heart love',
  '💗': 'growing heart love', '💖': 'sparkling heart love', '💘': 'heart with arrow love cupid', '💝': 'heart with ribbon love gift',
  '👋': 'waving hand', '🤚': 'raised back of hand', '✋': 'raised hand', '👌': 'OK hand',
  '✌️': 'victory hand', '🤞': 'crossed fingers', '🤟': 'love-you gesture', '🤘': 'sign of the horns',
  '🤙': 'call me hand', '👈': 'backhand index pointing left', '👉': 'backhand index pointing right',
  '👆': 'backhand index pointing up', '👇': 'backhand index pointing down', '☝️': 'index pointing up',
  '👍': 'thumbs up', '👎': 'thumbs down', '✊': 'raised fist', '👊': 'oncoming fist',
  '👏': 'clapping hands', '🙌': 'raising hands', '👐': 'open hands', '🤲': 'palms up together',
  '🤝': 'handshake', '🙏': 'folded hands', '✍️': 'writing hand', '💅': 'nail polish',
  '👀': 'eyes', '👁️': 'eye', '👅': 'tongue', '👄': 'mouth',
  '💼': 'briefcase', '📱': 'mobile phone', '💻': 'laptop', '⌨️': 'keyboard',
  '🖥️': 'desktop computer', '🖨️': 'printer', '🖱️': 'computer mouse', '💡': 'light bulb idea',
  '🔍': 'magnifying glass tilted left', '🔎': 'magnifying glass tilted right', '💰': 'money bag',
  '💵': 'dollar banknote', '💳': 'credit card', '💎': 'gem stone', '⚖️': 'balance scale',
  '📚': 'books school education study learning', '📖': 'open book school education reading study',
  '📕': 'closed book school education study', '📗': 'green book school education study',
  '📘': 'blue book school education study', '📙': 'orange book school education study',
  '📔': 'notebook school education notes study', '📓': 'notebook school education notes',
  '📒': 'ledger notebook school education', '✏️': 'pencil school education writing study',
  '✍️': 'writing hand school education study notes', '🎓': 'graduation cap school education graduate university college',
  '🏫': 'school education learning building university college', '🎒': 'backpack school education student',
  '🔧': 'wrench', '🔨': 'hammer', '🛠️': 'hammer and wrench', '⚙️': 'gear',
  '🚗': 'automobile', '🚕': 'taxi', '🚙': 'sport utility vehicle', '🚌': 'bus',
  '🚎': 'trolleybus', '🏎️': 'racing car', '🚓': 'police car', '🚑': 'ambulance',
  '🚒': 'fire engine', '🚚': 'delivery truck', '🚛': 'articulated lorry', '🚲': 'bicycle',
  '🏍️': 'motorcycle', '✈️': 'airplane', '🛫': 'airplane departure', '🛬': 'airplane arrival',
  '🛸': 'flying saucer', '🚁': 'helicopter', '⛵': 'sailboat',
  '🎉': 'party popper', '🎊': 'confetti ball', '🎈': 'balloon', '🎁': 'wrapped gift',
  '🎀': 'ribbon', '🏆': 'trophy', '🥇': '1st place medal', '🥈': '2nd place medal',
  '🥉': '3rd place medal', '🎯': 'direct hit', '🎮': 'video game', '🎲': 'game die',
  '🍕': 'pizza', '🍔': 'hamburger', '🍟': 'french fries', '🌭': 'hot dog',
  '🥪': 'sandwich', '🌮': 'taco', '🌯': 'burrito', '🍗': 'poultry leg',
  '🍖': 'meat on bone', '🥩': 'cut of meat', '🍞': 'bread', '🧀': 'cheese wedge',
  '🥚': 'egg', '🍳': 'cooking', '🥓': 'bacon',
  '☕': 'hot beverage', '🍵': 'teacup without handle', '🍺': 'beer mug', '🍻': 'clinking beer mugs',
  '🥂': 'clinking glasses', '🍷': 'wine glass', '🍸': 'cocktail glass', '🍹': 'tropical drink',
  '🌍': 'globe showing Europe-Africa', '🌎': 'globe showing Americas', '🌏': 'globe showing Asia-Australia',
  '🌐': 'globe with meridians', '🗺️': 'world map', '🏔️': 'snow-capped mountain', '⛰️': 'mountain',
  '🏕️': 'camping', '🏖️': 'beach with umbrella', '🏝️': 'desert island', '🌋': 'volcano',
};

const EMOJI_CATEGORIES = {
  'Smileys & Emotion': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
    '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
    '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
    '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
    '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
    '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀',
    '😿', '😾'
  ],
  'Gestures & Body': [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿',
    '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄'
  ],
  'Objects & Symbols': [
    '💼', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀',
    '🎥', '📷', '📸', '📹', '📼', '🔍', '🔎', '💡', '🔦', '🏮', '📔', '📕',
    '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📄', '📰', '🗞️', '📑',
    '🔖', '💰', '💵', '💴', '💶', '💷', '💸', '💳', '🧾', '💎', '⚖️', '🔧',
    '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '⛓️', '🔫', '💣', '🔪', '🗡️', '⚔️',
    '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '💈', '⚗️', '🔭', '🔬', '🕳️'
  ],
  'Activities & Sports': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓',
    '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋',
    '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸',
    '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵',
    '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
    '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'
  ],
  'Nature & Animals': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤',
    '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛',
    '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎',
    '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
    '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪',
    '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐',
    '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩',
    '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'
  ],
  'Food & Drink': [
    '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑',
    '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒',
    '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯',
    '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪',
    '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈',
    '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣',
    '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪',
    '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭',
    '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺',
    '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊'
  ],
  'Travel & Places': [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛',
    '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍',
    '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈',
    '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀',
    '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '⛽', '🚧',
    '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢',
    '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺',
    '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦',
    '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️'
  ],
  'Hearts & Celebration': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
    '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍',
    '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴',
    '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑',
    '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵',
    '🎉', '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '⚾', '🥎',
    '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓'
  ]
};

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const { selectedBrand } = useBrandStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Smileys & Emotion');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>(DEFAULT_EMOJI_SUGGESTIONS);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);

  // Load brand-aware emoji suggestions
  useEffect(() => {
    if (selectedBrand) {
      getBrandEmojiSuggestions(selectedBrand).then(suggestions => {
        setEmojiSuggestions(suggestions);
      }).catch(error => {
        console.error('Failed to load brand emoji suggestions:', error);
        setEmojiSuggestions(DEFAULT_EMOJI_SUGGESTIONS);
      });
    } else {
      setEmojiSuggestions(DEFAULT_EMOJI_SUGGESTIONS);
    }
  }, [selectedBrand]);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  // Filter emojis based on search query
  const getFilteredEmojis = () => {
    if (!searchQuery.trim()) {
      return EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES] || [];
    }

    // Search across all categories by emoji name
    const query = searchQuery.toLowerCase().trim();
    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();

    return allEmojis.filter((emoji) => {
      const name = EMOJI_NAMES[emoji];
      if (!name) return false; // Exclude emoji if no name mapping
      return name.toLowerCase().includes(query);
    });
  };

  const filteredEmojis = getFilteredEmojis();

  // Reset selected index when filtered emojis change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeCategory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const cols = 8; // Grid cols
      const rows = Math.ceil(filteredEmojis.length / cols);

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredEmojis.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredEmojis.length) % filteredEmojis.length);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev + cols;
            return newIndex < filteredEmojis.length ? newIndex : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev - cols;
            return newIndex >= 0 ? newIndex : prev;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredEmojis[selectedIndex]) {
            handleEmojiSelect(filteredEmojis[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredEmojis, selectedIndex]);

  // Scroll selected emoji into view
  useEffect(() => {
    if (emojiGridRef.current) {
      const selectedButton = emojiGridRef.current.querySelector(
        `button:nth-child(${selectedIndex + 1})`
      ) as HTMLElement;
      selectedButton?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="relative inline-block">
      {/* Emoji Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
        title="Insert emoji"
      >
        <Smile className="w-5 h-5 text-muted-foreground hover:text-primary" />
      </button>

      {/* Emoji Picker Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker Panel */}
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-card border-2 border-primary rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
            {/* Header with search */}
            <div className="p-3 border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emojis (e.g., 'fire', 'heart', 'rocket')..."
                className="w-full bg-background text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <div className="text-xs text-muted-foreground mt-1">
                Use arrow keys to navigate, Enter to select, Esc to close
              </div>
            </div>

            {/* Suggestions (always visible at top) */}
            <div className="p-3 border-b border-border">
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Quick Picks {selectedBrand && '(Brand Suggestions)'}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {emojiSuggestions.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl p-2 hover:bg-secondary rounded-md transition-colors"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
              <div className="flex overflow-x-auto border-b border-border scrollbar-thin scrollbar-thumb-border">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeCategory === category
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Grid */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {searchQuery && (
                <div className="text-xs text-muted-foreground mb-2">
                  Search results for "{searchQuery}"
                </div>
              )}
              <div ref={emojiGridRef} className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`text-2xl p-2 rounded-md transition-all group relative ${
                      selectedIndex === index
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'hover:bg-secondary'
                    }`}
                    title={EMOJI_NAMES[emoji] || emoji}
                  >
                    {emoji}
                    {/* Tooltip on hover */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {EMOJI_NAMES[emoji] || emoji}
                    </span>
                  </button>
                ))}
              </div>
              {filteredEmojis.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No emojis found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
