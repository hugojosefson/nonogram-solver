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
lineToString [] = ""
lineToString xs = foldl1 (++) (fmap show xs)

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

maybeOverlaps :: Maybe Line -> Maybe Line -> Maybe Line
maybeOverlaps Nothing (Just b) = Nothing
maybeOverlaps (Just a) Nothing = Nothing
maybeOverlaps (Just a) (Just b) = Just(zipWith overlap a b)

overlap :: Cell -> Cell -> Cell
overlap Filled Filled = Filled
overlap (ProbablyHint a) (ProbablyHint b) =
  if a == b then Filled
  else Unknown
overlap (ProbablyHint a) Unknown = Filled
overlap Unknown (ProbablyHint a) = Filled
overlap (Clear Decided) (Clear Decided) = Clear Decided

solveLine :: Hints -> Line -> Maybe Line
solveLine [] line = Just line
solveLine hints [] = Just []
solveLine hints line = maybeOverlaps (placeFromLeft hints line) (placeFromRight hints line)

