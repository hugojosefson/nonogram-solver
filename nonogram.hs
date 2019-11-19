import Numeric (showHex)
import Data.Text.Internal.Read (hexDigitToInt)

data Cell =
  Unknown | Filled | Clear ClearReason | ProbablyHint HintName

data ClearReason =
  Decided | Requested ClearLocation

data ClearLocation =
  Before | Outer | After

instance Show Cell where
  show Unknown = " "
  show Filled = "*"
  show (ProbablyHint a) = show a
  show (Clear Decided) = "."
  show (Clear (Requested Before)) = "["
  show (Clear (Requested Outer)) = "_"
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
charToCell '_' = Clear (Requested Outer)
charToCell ']' = Clear (Requested After)
charToCell c = ProbablyHint $ HintName $ hexDigitToInt c

type Line = [Cell]
type Hints = [Hint]

intsToHints :: [Int] -> Hints
intsToHints [] = []
intsToHints (n:ns) = (Hint (HintName (length ns)) n True:intsToHints ns)

data Hint = Hint { name :: HintName
                 , value :: Int
                 , isFirstCell :: Bool
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
    if canClearCell then fmap (\line -> ((Clear $ Requested Outer):line)) maybeClearedLine
    else Nothing

placeFromLeft :: Hints -> Line -> Maybe Line

-- No hints in empty line
placeFromLeft [] [] = Just []

-- 0 size hint in empty line
placeFromLeft [Hint _ 0 _] [] = Just []

-- We have more hints to place, but have run out of space.
placeFromLeft hints [] = Nothing

-- We have just finished placing all hints, and there is some space left.
-- Try to clear remaining space.
placeFromLeft [] line = placeClear line

-- We have just finished placing one hint, and its value is down to 0.
-- There is room for a (Clear $ Requested After) in the cell to the right, so we'll place it there as padding.
placeFromLeft ((Hint _ 0 _):hints) (Unknown:line) =
  let
    maybePlaced = placeFromLeft hints line
  in
    case maybePlaced of
      Nothing -> Nothing
      Just placed -> Just ((Clear $ Requested After):placed)

-- We have just finished placing one hint, and its value is down to 0.
-- There is already a Clear in the cell to the right, so we'll keep that as padding.
placeFromLeft (hint@(Hint _ 0 _):hints) (Clear c:line) =
  let
    maybePlaced = placeFromLeft hints line
  in
    case maybePlaced of
      Nothing -> Nothing
      Just placed -> Just ((Clear c):placed)


-- We are placing a hint, and there is room.
-- Continue recursing after shortening the hint and remaining line.
placeFromLeft (hint@(Hint name value isFirstCell):hints) (Unknown:line) =
  let
    shortenedHint = Hint name (value - 1) False
    maybePlaced = placeFromLeft (shortenedHint:hints) line
  in
    case maybePlaced of
      Just placed -> Just ((ProbablyHint name):placed)
      Nothing -> case isFirstCell of
        False -> Nothing
        True ->
          let
            maybePlaced' = placeFromLeft (hint:hints) line
          in
            case maybePlaced' of
              Nothing -> Nothing
              Just placed' -> Just ((Clear $ Requested Outer):placed')

-- *Main> fmap lineToString $ placeFromLeft  (intsToHints [2,5]) (stringToLine "              *")
-- Just "11]_______0000*"
-- *Main> fmap lineToString $ placeFromRight   (intsToHints [2,5]) (stringToLine "              *")
-- Just "______]11]0000*"
-- *Main> fmap lineToString $ solveLine (intsToHints [2,5]) (stringToLine "              *")
-- Just "          *****"
-- *Main> TODO place (Clear $ Requested Before) on the cell before a new hint, unless we backtrack


-- We are placing a hint, and the cell is filled.
-- Continue recursing after shortening the hint and remaining line.
placeFromLeft (hint@(Hint name value isFirstCell):hints) (Filled:line) =
  let
    shortenedHint = Hint name (value - 1) False
    maybePlaced = placeFromLeft (shortenedHint:hints) line
  in
    case maybePlaced of
      Nothing -> Nothing
      Just placed -> Just (Filled:placed)

-- We are placing a hint, but the cell is occupied
placeFromLeft ((Hint name value _):hints) (_:line) = Nothing


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
maybeOverlaps line (Just a) Nothing = Nothing
maybeOverlaps line Nothing (Just b) = Nothing
maybeOverlaps line (Just a) (Just b) = Just (zipWith3 overlap3 line a b)

overlap3 :: Cell -> Cell -> Cell -> Cell
overlap3 _ Filled Filled = Filled
overlap3 c (ProbablyHint a) (ProbablyHint b) =
  if a == b then Filled
  else c
overlap3 _ (Clear Decided) (Clear Decided) = Clear Decided
overlap3 _ (Clear (Requested After)) (Clear (Requested After)) = Clear Decided
overlap3 _ (Clear (Requested Before)) (Clear (Requested Before)) = Clear Decided
overlap3 _ Unknown (Clear (Requested After)) = Clear Decided
overlap3 _ (Clear (Requested Before)) Unknown = Clear Decided
overlap3 _ Unknown (Clear (Requested Before)) = Clear Decided
overlap3 _ (Clear (Requested After)) Unknown = Clear Decided
overlap3 c _ _ = c

solveLine :: Hints -> Line -> Maybe Line
solveLine [] line = Just line
solveLine hints [] = Just []
solveLine hints line = maybeOverlaps line (placeFromLeft hints line) (placeFromRight hints line)

