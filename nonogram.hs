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
  show Filled = "*"
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

intsToHints :: [Int] -> Hints
intsToHints [] = []
intsToHints (n:ns) = (Hint (HintName (length ns)) n:intsToHints ns)

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
    if canClearCell then fmap (\line -> ((Clear Decided):line)) maybeClearedLine
    else Nothing

placeFromLeft :: Hints -> Line -> Maybe Line
placeFromLeft [] [] = Just []
placeFromLeft [Hint _ 0] [] = Just []
placeFromLeft hints [] = Nothing
placeFromLeft [] line = placeClear line
placeFromLeft ((Hint _ 0):hints) (Unknown:line) = prepend (Clear $ Requested After) (placeFromLeft hints line)
placeFromLeft ((Hint _ 0):hints) (Clear c:line) = prepend (Clear c) (placeFromLeft hints line)
placeFromLeft ((Hint name value):hints) (Unknown:line) = prepend (ProbablyHint name) (placeFromLeft ((Hint name $ value - 1):hints) line)
placeFromLeft ((Hint name value):hints) (Filled:line) = prepend Filled (placeFromLeft ((Hint name $ value - 1):hints) line)
placeFromLeft ((Hint name value):hints) (_:line) = Nothing
-- TODO backtrack, and retry differently, if we're on the wrong track

prepend :: Cell -> Maybe Line -> Maybe Line
prepend _ Nothing = Nothing
prepend cell (Just(line)) = Just((cell:line))

placeFromRight :: Hints -> Line -> Maybe Line
placeFromRight hints line =
  let
    numberOfHints = length hints
    rHints = reverse hints
    rLine = reverse line
    maybePlacedLine = placeFromLeft rHints rLine
  in
    fmap reverse maybePlacedLine

maybeOverlaps :: Line -> Maybe Line -> Maybe Line -> Maybe Line
maybeOverlaps line Nothing Nothing = Nothing
maybeOverlaps line (Just a) Nothing = Just (zipWith overlap2 line a)
maybeOverlaps line Nothing (Just b) = Just (zipWith overlap2 line b)
maybeOverlaps line (Just a) (Just b) = Just (zipWith3 overlap3 line a b)

overlap2 :: Cell -> Cell -> Cell
overlap2 Filled Filled = Filled
overlap2 c (ProbablyHint a) = Filled
overlap2 c Unknown = c
overlap2 (Clear Decided) (Clear _) = Clear Decided
overlap2 c _ = c

overlap3 :: Cell -> Cell -> Cell -> Cell
overlap3 _ Filled Filled = Filled
overlap3 c (ProbablyHint a) (ProbablyHint b) =
  if a == b then Filled
  else c
overlap3 _ (ProbablyHint a) Unknown = Filled
overlap3 _ Unknown (ProbablyHint a) = Filled
overlap3 _ (Clear Decided) (Clear Decided) = Clear Decided
overlap3 _ (Clear (Requested After)) (Clear (Requested After)) = Clear Decided
overlap3 _ (Clear (Requested Before)) (Clear (Requested Before)) = Clear Decided
overlap3 c _ _ = c

solveLine :: Hints -> Line -> Maybe Line
solveLine [] line = Just line
solveLine hints [] = Just []
solveLine hints line = maybeOverlaps line (placeFromLeft hints line) (placeFromRight hints line)

