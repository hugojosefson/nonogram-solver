data Cell =
  Unknown | Filled | Clear ClearReason | ProbablyHint Hint

data ClearReason =
  Decided | Requested ClearLocation

data ClearLocation =
  Before | After

instance Show Cell where
  show Unknown = " "
  show Filled = "#"
  show (ProbablyHint a) = show a
  show (Clear Decided) = "x"
  show (Clear (Requested Before)) = "["
  show (Clear (Requested After)) = "]"

lineToString :: Line -> String
lineToString = concatMap show

stringToLine :: String -> Line
stringToLine = fmap charToCell

charToCell :: Char -> Cell
charToCell ' ' = Unknown
charToCell '#' = Filled
charToCell 'x' = Clear Decided
charToCell '[' = Clear (Requested Before)
charToCell ']' = Clear (Requested After)

type Line = [Cell]
type Hints = [Hint]
type Hint = Int
type HintIndex = Int
type CellOffset = Int

placeHintsOnLine :: Hints -> Line -> CellOffset -> HintIndex -> (HintIndex -> HintIndex) -> Maybe Line
placeHintsOnLine hints line cellOffset hintIndex hintIndexModifier = undefined

placeFromLeft :: Hints -> Line -> Maybe Line
placeFromLeft hints line = placeHintsOnLine hints line 0 0 id

placeFromRight :: Hints -> Line -> Maybe Line
placeFromRight hints line =
  let
    rHints = reverse hints
    rLine = reverse line
    placedFromLeft = placeHintsOnLine rHints rLine 0 0 (reverseHintIndex line)
  in
    reverseBackPlacedLine placedFromLeft

reverseBackPlacedLine :: Maybe Line -> Maybe Line
reverseBackPlacedLine Nothing = Nothing
reverseBackPlacedLine (Just line) = Just(fmap reverseClearRequest (reverse line))

reverseHintIndex :: Line -> HintIndex -> HintIndex
reverseHintIndex line hintIndex = (length line) - 1 - hintIndex

reverseClearRequest :: Cell -> Cell
reverseClearRequest (Clear (Requested Before)) = Clear (Requested After)
reverseClearRequest (Clear (Requested After)) = Clear (Requested Before)
reverseClearRequest x = x

maybeOverlaps :: Line -> Maybe Line -> Maybe Line -> Line
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

