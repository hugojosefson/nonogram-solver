data Cell =
  Unknown | Filled | Clear ClearReason | PossibleForHint Hint

data ClearReason =
  Decided | Requested ClearLocation

data ClearLocation =
  Before | After

instance Show Cell where
  show Unknown = " "
  show Filled = "#"
  show (PossibleForHint a) = show a
  show (Clear Decided) = "x"
  show (Clear (Requested Before)) = "["
  show (Clear (Requested After)) = "]"

cellsToString :: [Cell] -> String
cellsToString [] = ""
cellsToString xs = foldl1 (++) (fmap show xs)

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
reverseBackPlacedLine (Just line)

reverseHintIndex :: Line -> HintIndex -> HintIndex
reverseHintIndex line hintIndex = (length line) - 1 - hintIndex

reverseClearRequest :: Cell -> Cell
reverseClearRequest (Clear (Requested Before)) = Clear (Requested After)
reverseClearRequest (Clear (Requested After)) = Clear (Requested Before)
reverseClearRequest x = x

overlaps :: Maybe line -> Maybe line -> Maybe line
overlaps Nothing (Just b) = Nothing
overlaps (Just a) Nothing = Nothing
overlaps (Just a) (Just b) = undefined

solveLine :: Hints -> Line -> Maybe Line
solveLine [] line = Just line
solveLine hints [] = Just []
solveLine hints line = overlaps (placeFromLeft hints line) (placeFromRight hints line)

