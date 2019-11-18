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
data HintName = Hint0 | Hint1 | Hint2 | Hint3 | Hint4 | Hint5 | Hint6 | Hint7 deriving (Eq, Show)
hintNames = [Hint0, Hint1, Hint2, Hint3, Hint4, Hint5, Hint6, Hint7]

canClear :: Cell -> Bool
canClear (Clear _) = True
canClear Unknown = True
canClear _ = False

placeClearForTheRest :: Line -> Maybe Line
placeClearForTheRest [] = Just []
placeClearForTheRest (cell:line) = Just $ [Clear Decided, ...(placeClearForTheRest line).unwrap]

placeHintsOnLine :: Hints -> Line -> (HintName -> HintName) -> Maybe Line
placeHintsOnLine [] [] hintNameModifier = Just []
placeHintsOnLine [] line hintNameModifier = placeClearForTheRest line
placeHintsOnLine hints [] hintNameModifier = Nothing
--placeHintsOnLine (hint:hints) (cell:cells) hintNameModifier =

placeFromLeft :: Hints -> Line -> Maybe Line
placeFromLeft hints line = placeHintsOnLine hints line id

placeFromRight :: Hints -> Line -> Maybe Line
placeFromRight hints line =
  let
    rHints = reverse hints
    rLine = reverse line
    placedFromLeft = placeHintsOnLine rHints rLine (reverseHintName $ length rHints)
  in
    reverseBackPlacedLine placedFromLeft

reverseBackPlacedLine :: Maybe Line -> Maybe Line
reverseBackPlacedLine Nothing = Nothing
reverseBackPlacedLine (Just line) = Just(fmap reverseClearRequest (reverse line))

reverseHintName :: Int -> HintName -> HintName
reverseHintName hintsLength Hint0 = nth (hintsLength - 1) hintNames
reverseHintName hintsLength Hint1 = nth (hintsLength - 2) hintNames
reverseHintName hintsLength Hint2 = nth (hintsLength - 3) hintNames
reverseHintName hintsLength Hint3 = nth (hintsLength - 4) hintNames
reverseHintName hintsLength Hint4 = nth (hintsLength - 5) hintNames
reverseHintName hintsLength Hint5 = nth (hintsLength - 6) hintNames
reverseHintName hintsLength Hint6 = nth (hintsLength - 7) hintNames
reverseHintName hintsLength Hint7 = nth (hintsLength - 8) hintNames

nth :: Int -> [a] -> a
nth n xs = head $ reverse $ take (n + 1) xs

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

