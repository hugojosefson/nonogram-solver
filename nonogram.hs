import Numeric (showHex)
import Data.Text.Internal.Read (hexDigitToInt)

data Cell =
  Unknown | Filled | Clear ClearReason | ProbablyHint HintName

data ClearReason =
  Decided | Requested ClearLocation

data ClearLocation =
  Before | Middle | After

instance Show Cell where
  show Unknown = " "
  show Filled = "X"
  show (ProbablyHint a) = show a
  show (Clear Decided) = "."
  show (Clear (Requested Before)) = "["
  show (Clear (Requested Middle)) = "_"
  show (Clear (Requested After)) = "]"

lineToString :: Line -> String
lineToString = concatMap show

stringToLine :: String -> Line
stringToLine = fmap charToCell

charToCell :: Char -> Cell
charToCell ' ' = Unknown
charToCell '*' = Filled
charToCell '.' = Clear Decided
charToCell '[' = Clear (Requested Before)
charToCell '_' = Clear (Requested Middle)
charToCell ']' = Clear (Requested After)
charToCell c = ProbablyHint $ HintName $ hexDigitToInt c

type Line = [Cell]
type Hints = [Hint]

data Hint = Hint { name :: HintName
                 , value :: Int
                 }
  deriving (Read, Show, Eq)

instance Ord Hint where
  compare h1 h2 = compare (name h1) (name h2)

data HintName = HintName Int
  deriving (Read, Eq, Ord)

instance Show HintName where
  show (HintName a) = showHex a ""

canClear :: Cell -> Bool
canClear (Clear _) = True
canClear Unknown = True
canClear _ = False

placeClear :: Line -> Maybe Line
placeClear [] = Just []
placeClear (cell:line) =
  let
    canClearCell = canClear cell
    maybeClearedLine = placeClear line
  in
    if canClearCell then fmap (\line -> ((Clear $ Requested Middle):line)) maybeClearedLine
    else Nothing

placeHints :: Hints -> Line -> (HintName -> HintName) -> Maybe Line
placeHints [] [] _ = Just []
placeHints [Hint name 0] [] _ = Just []
placeHints hints [] _ = Nothing
placeHints [] line _ = placeClear line
placeHints ((Hint name 0):hints) (Unknown:line) hnm = prepend ((Clear $ Requested Middle)) (placeHints hints line hnm)
placeHints ((Hint name value):hints) (Unknown:line) hnm = prepend (ProbablyHint $ hnm name) (placeHints ((Hint name $ value - 1):hints) line hnm)
placeHints ((Hint name value):hints) (Filled:line) hnm = prepend Filled (placeHints ((Hint name $ value - 1):hints) line hnm)
placeHints ((Hint name value):hints) (_:line) _ = Nothing
-- TODO backtrack, and retry differently, if we're on the wrong track

prepend :: Cell -> Maybe Line -> Maybe Line
prepend _ Nothing = Nothing
prepend cell (Just(line)) = Just((cell:line))

placeFromLeft :: Hints -> Line -> Maybe Line
placeFromLeft hints line = placeHints hints line id

placeFromRight :: Hints -> Line -> Maybe Line
placeFromRight hints line =
  let
    rHints = reverse hints
    rLine = reverse line
    placedFromLeft = placeHints rHints rLine (reverseHintName $ length rHints)
  in
    reverseBackPlacedLine placedFromLeft

reverseBackPlacedLine :: Maybe Line -> Maybe Line
reverseBackPlacedLine Nothing = Nothing
reverseBackPlacedLine (Just line) = Just(fmap reverseClearRequest (reverse line))

reverseHintName :: Int -> HintName -> HintName
reverseHintName hintsLength (HintName a) = HintName (hintsLength - 1 - a)

reverseClearRequest :: Cell -> Cell
reverseClearRequest (Clear (Requested Before)) = Clear (Requested After)
reverseClearRequest (Clear (Requested After)) = Clear (Requested Before)
reverseClearRequest x = x

maybeOverlaps :: Line -> Maybe Line -> Maybe Line -> Line
maybeOverlaps line Nothing Nothing = line
maybeOverlaps line Nothing (Just b) = line
maybeOverlaps line (Just a) Nothing = line
maybeOverlaps line (Just a) (Just b) = zipWith3 overlap line a b

overlap :: Cell -> Cell -> Cell -> Cell
overlap _ Filled Filled = Filled
overlap c (ProbablyHint a) (ProbablyHint b) =
  if a == b then Filled
  else c
overlap _ (ProbablyHint a) Unknown = Filled
overlap _ Unknown (ProbablyHint a) = Filled
overlap _ (Clear Decided) (Clear Decided) = Clear Decided
overlap c _ _ = c

solveLine :: Hints -> Line -> Line
solveLine [] line = line
solveLine hints [] = []
solveLine hints line = maybeOverlaps line (placeFromLeft hints line) (placeFromRight hints line)

